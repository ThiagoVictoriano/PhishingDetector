from fastapi import FastAPI
from pydantic import BaseModel
from app.utils import (
    check_openphish, detect_number_substitution, has_special_characters,
    extract_domain, get_domain_age, check_dynamic_dns, get_ssl_info,
    detect_redirects, check_brand_similarity, analyze_content
)

app = FastAPI()

class URLInput(BaseModel):
    url: str

@app.post("/checkurl")
def check_url(data: URLInput):
    url = data.url
    domain = extract_domain(url)
    
    # Executar todas as análises
    openphish_result = check_openphish(url)
    number_substitution_result = detect_number_substitution(domain)
    special_characters_result = has_special_characters(url)
    domain_age_result = get_domain_age(url)
    dynamic_dns_result = check_dynamic_dns(url)
    ssl_info_result = get_ssl_info(url)
    redirects_result = detect_redirects(url)
    brand_similarity_result = check_brand_similarity(url)
    content_analysis_result = analyze_content(url)
    
    result = {
        "url": url,
        "domain": domain,
        "is_in_openphish": openphish_result,
        "has_number_substitution": number_substitution_result,
        "has_special_characters": special_characters_result,
        "domain_age": domain_age_result,
        "uses_dynamic_dns": dynamic_dns_result,
        "ssl_info": ssl_info_result,
        "redirects": redirects_result,
        "brand_similarity": brand_similarity_result,
        "content_analysis": content_analysis_result,
    }
    
    return result