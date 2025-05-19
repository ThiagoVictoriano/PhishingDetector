import re
import requests
import tldextract
import whois
from bs4 import BeautifulSoup
import ssl
import socket
from datetime import datetime
import Levenshtein
from urllib.parse import urlparse

# Verifica presença em listas públicas
OPENPHISH_FEED = "https://openphish.com/feed.txt"
PHISHTANK_FEED = "https://data.phishtank.com/data/online-valid.json"

SPECIAL_CHARS = r"[!@#$%^&*()_+=\[\]{};:'\"\\|,.<>/?]"  # Mantém a expressão regular, mas será aplicada apenas ao domínio

# Lista de provedores de DNS dinâmico
DYNAMIC_DNS_PROVIDERS = [
    'no-ip.com', 'dyndns.org', 'duckdns.org', 'freedns.afraid.org', 'nsupdate.info'
]

# Lista de marcas conhecidas
KNOWN_BRANDS = [
    'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
    'paypal.com', 'netflix.com', 'instagram.com', 'twitter.com', 'linkedin.com'
]

def fetch_openphish():
    try:
        response = requests.get(OPENPHISH_FEED, timeout=10)
        if response.status_code == 200:
            return response.text.splitlines()
    except:
        pass
    return []

def check_openphish(url: str) -> bool:
    feed = fetch_openphish()
    return any(entry in url for entry in feed)

def detect_number_substitution(domain: str) -> bool:
    """
    Detecta números no domínio que podem estar substituindo letras, como 'g00gle.com'.
    Args:
        domain: URL ou domínio a ser verificado (e.g., 'g00gle.com', 'https://1nstagram.com').
    Returns:
        bool: True se há números sugerindo substituição de letras, False caso contrário.
    """
    extracted = tldextract.extract(domain)
    domain_str = extracted.domain
    
    substitutions = {
        "0": ["o", "O"],
        "1": ["i", "I", "l", "L"],
        "3": ["e", "E"],
        "4": ["a", "A"],
        "5": ["s", "S"],
        "7": ["t", "T"],
        "8": ["b", "B"],
        "9": ["g", "G"]
    }
    
    if not any(char.isdigit() for char in domain_str):
        return False
    
    if domain_str.isdigit():
        return False
    
    for num, letters in substitutions.items():
        if num in domain_str:
            for letter in letters:
                test_domain = domain_str.replace(num, letter)
                if test_domain.isalpha():
                    return True
    
    return False

def has_special_characters(url: str) -> bool:
    """
    Verifica a presença de caracteres especiais apenas no domínio principal (exclui subdomínios como 'www').
    Args:
        url: URL a ser verificada (e.g., 'https://www.google.com').
    Returns:
        bool: True se o domínio principal contém caracteres especiais, False caso contrário.
    """
    extracted = tldextract.extract(url)
    domain_str = extracted.domain  # Verifica apenas o domínio principal (e.g., 'google' em 'www.google.com')
    return bool(re.search(SPECIAL_CHARS, domain_str))

def extract_domain(url: str) -> str:
    extracted = tldextract.extract(url)
    return f"{extracted.domain}.{extracted.suffix}"

def get_domain_age(url: str) -> dict:
    """
    Consulta WHOIS para obter a idade do domínio.
    Returns:
        dict: Idade em dias, data de criação e se é suspeito (menos de 6 meses).
    """
    try:
        domain = extract_domain(url)
        w = whois.whois(domain)
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        if creation_date:
            age_days = (datetime.now() - creation_date).days
            is_suspicious = age_days < 180  # Menos de 6 meses
            return {
                'age_days': age_days,
                'creation_date': creation_date.strftime('%Y-%m-%d'),
                'is_suspicious': is_suspicious
            }
    except:
        pass
    return {'age_days': None, 'creation_date': None, 'is_suspicious': True}

def check_dynamic_dns(url: str) -> bool:
    """
    Verifica se o domínio usa provedores de DNS dinâmico.
    Returns:
        bool: True se usa DNS dinâmico, False caso contrário.
    """
    extracted = tldextract.extract(url)
    domain = f"{extracted.domain}.{extracted.suffix}"
    subdomain = extracted.subdomain
    full_domain = f"{subdomain}.{domain}" if subdomain else domain
    return any(provider in full_domain.lower() for provider in DYNAMIC_DNS_PROVIDERS)

def get_ssl_info(url: str) -> dict:
    """
    Analisa o certificado SSL do domínio.
    Returns:
        dict: Emissor, data de expiração, coincidência com domínio e se é suspeito.
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or tldextract.extract(url).registered_domain
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                issuer = dict(x[0] for x in cert['issuer']).get('organizationName', '')
                expiry = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                subject = dict(x[0] for x in cert['subject']).get('commonName', '')
                san = [x[1] for x in cert.get('subjectAltName', []) if x[0] == 'DNS']
                
                domain = tldextract.extract(url).registered_domain
                matches_domain = subject == domain or domain in san
                is_expired = expiry < datetime.now()
                is_suspicious = not matches_domain or is_expired or issuer == "Let's Encrypt"
                
                return {
                    'issuer': issuer,
                    'expiry_date': expiry.strftime('%Y-%m-%d'),
                    'matches_domain': matches_domain,
                    'is_expired': is_expired,
                    'is_suspicious': is_suspicious
                }
    except:
        return {
            'issuer': None,
            'expiry_date': None,
            'matches_domain': False,
            'is_expired': True,
            'is_suspicious': True
        }

def detect_redirects(url: str) -> dict:
    """
    Detecta redirecionamentos suspeitos.
    Returns:
        dict: Lista de redirecionamentos, contagem e se é suspeito.
    """
    try:
        response = requests.get(url, allow_redirects=True, timeout=10)
        history = response.history
        redirects = [{'from': r.url, 'to': r.headers.get('Location', '')} for r in history]
        original_domain = tldextract.extract(url).registered_domain
        is_suspicious = len(redirects) > 2 or any(
            tldextract.extract(r['to']).registered_domain != original_domain for r in redirects
        )
        return {
            'redirects': redirects,
            'count': len(redirects),
            'is_suspicious': is_suspicious
        }
    except:
        return {'redirects': [], 'count': 0, 'is_suspicious': True}

def check_brand_similarity(url: str) -> dict:
    """
    Verifica similaridade com domínios de marcas conhecidas usando Levenshtein.
    Returns:
        dict: Lista de similaridades e se é suspeito.
    """
    extracted = tldextract.extract(url)
    domain = f"{extracted.domain}.{extracted.suffix}"
    similarities = []
    for brand in KNOWN_BRANDS:
        distance = Levenshtein.distance(domain.lower(), brand.lower())
        if distance < 3 and distance > 0:
            similarities.append({'brand': brand, 'distance': distance})
    return {
        'similarities': similarities,
        'is_suspicious': bool(similarities)
    }

def analyze_content(url: str) -> dict:
    """
    Analisa o conteúdo da página para detectar formulários de login e informações sensíveis.
    Returns:
        dict: Presença de formulários, palavras-chave sensíveis e se é suspeito.
    """
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        forms = soup.find_all('form')
        has_login_form = any(
            form.find('input', {'type': 'password'}) or
            any('login' in (input.get('name', '').lower() or '') for input in form.find_all('input'))
            for form in forms
        )
        
        sensitive_keywords = ['login', 'password', 'credit card', 'ssn', 'social security']
        text = soup.get_text().lower()
        sensitive_info = [kw for kw in sensitive_keywords if kw in text]
        
        return {
            'has_login_form': has_login_form,
            'sensitive_keywords': sensitive_info,
            'is_suspicious': has_login_form or bool(sensitive_info)
        }
    except:
        return {
            'has_login_form': False,
            'sensitive_keywords': [],
            'is_suspicious': True
        }