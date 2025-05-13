import re
import requests
import tldextract

# Verifica presença em listas públicas (simulado com lista local)
OPENPHISH_FEED = "https://openphish.com/feed.txt"
PHISHTANK_FEED = "https://data.phishtank.com/data/online-valid.json"

SPECIAL_CHARS = r"[!@#$%^&*()_+=\[\]{};:'\"\\|,.<>/?]"

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

import re
import tldextract

def detect_number_substitution(domain: str) -> bool:
    """
    Detecta números no domínio que podem estar substituindo letras, como 'g00gle.com'.
    Args:
        domain: URL ou domínio a ser verificado (e.g., 'g00gle.com', 'https://1nstagram.com').
    Returns:
        bool: True se há números sugerindo substituição de letras, False caso contrário.
    """
    # Extrai o domínio usando tldextract
    extracted = tldextract.extract(domain)
    domain_str = extracted.domain
    
    # Dicionário de substituições comuns
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
    
    # Verifica se há números no domínio
    if not any(char.isdigit() for char in domain_str):
        return False
    
    # Ignora domínios que são apenas números (e.g., '123')
    if domain_str.isdigit():
        return False
    
    # Verifica substituições suspeitas
    for num, letters in substitutions.items():
        if num in domain_str:
            for letter in letters:
                # Substitui o número pela letra
                test_domain = domain_str.replace(num, letter)
                # Verifica se o resultado é um domínio alfabético (e.g., 'google', 'instagram')
                if test_domain.isalpha():
                    return True
    
    return False

SPECIAL_CHARS = r"[!@#$%^&*()_+=\[\]{};:'\"\\|,.<>/?]"

def has_special_characters(url: str) -> bool:
    # Extrai componentes da URL
    extracted = tldextract.extract(url)
    
    # Constrói o domínio completo
    domain_part = f"{extracted.domain}.{extracted.suffix}"
    if extracted.subdomain:
        domain_part = f"{extracted.subdomain}.{domain_part}"
    
    # Verifica caracteres especiais no domínio e subdomínio
    domain_str = f"{extracted.subdomain}.{extracted.domain}" if extracted.subdomain else extracted.domain
    domain_has_special = bool(re.search(SPECIAL_CHARS, domain_str))
    
    # Remove o domínio da URL para obter o "caminho"
    remainder = url.replace(domain_part, "", 1).lstrip("/")
    
    print(f"Domain part: {domain_str}")
    print(f"Remainder: {remainder}")
    
    # Retorna True se houver caracteres especiais no domínio, subdomínio ou caminho
    return domain_has_special


def extract_domain(url: str) -> str:
    extracted = tldextract.extract(url)
    return f"{extracted.domain}.{extracted.suffix}"
