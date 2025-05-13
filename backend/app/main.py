from fastapi import FastAPI
from app.schema import URLInput
from app.utils import check_openphish, detect_number_substitution, has_special_characters, extract_domain

app = FastAPI()

@app.post("/checkurl")
def check_url(data: URLInput):
    url = data.url
    domain = extract_domain(url)

    result = {
        "url": url,
        "domain": domain,
        "is_in_openphish": check_openphish(url),
        "has_number_substitution": detect_number_substitution(domain),
        "has_special_characters": has_special_characters(url),
    }

    return result
