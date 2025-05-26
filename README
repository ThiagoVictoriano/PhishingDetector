# Phishing Detector

O **Phishing Detector** é uma solução composta por três componentes: uma extensão para o Firefox que detecta e bloqueia sites de phishing em tempo real, um backend baseado em FastAPI para análise de URLs e um frontend construído com React e Vite para permitir que os usuários insiram URLs e recebam dados detalhados sobre o nível de segurança. A extensão exibe notificações para sites seguros, suspeitos e perigosos, e ao clicar nas notificações, os usuários podem visualizar os critérios detalhados da análise.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

- **Firefox**: Versão 102 ou superior (recomendado para compatibilidade com Manifest V2).
- **Python**: Versão 3.6 ou superior para rodar o backend.
- **Node.js**: Versão 16 ou superior (para o frontend com Vite e React).
- **npm**: Para instalar as dependências do frontend.
- **Git**: Para clonar o repositório (opcional, se você baixar o código manualmente).
- **pip**: Para instalar as dependências do backend.

## Estrutura do Projeto

O projeto contém as seguintes pastas e arquivos:

```
phishing-detector/
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── (outros arquivos do backend)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   └── (arquivos React)
│   └── (outros arquivos do frontend)
├── phishing-detector-plugin/
│   ├── icons/
│   │   └── icon.png
│   ├── JS/
│   │   ├── background.js
│   │   └── content.js
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   ├── options.js
│   ├── blocked.html
│   ├── blocked.js
│   ├── details.html
│   ├── details.js
│   ├── styles.css
│   └── README.md
└── README.md
```

- **backend**: Contém o servidor FastAPI para análise de URLs.
- **frontend**: Interface web em React que permite inserir URLs e visualizar dados de segurança.
- **phishing-detector-plugin**: Extensão para o Firefox, incluindo uma página de detalhes (`details.html`) para exibir análises detalhadas ao clicar nas notificações.

## Instalação e Uso

### Passo 1: Baixar o Projeto
1. Clone o repositório ou baixe os arquivos manualmente:
   ```bash
   git clone https://github.com/seu-usuario/phishing-detector.git
   cd phishing-detector
   ```
   (Substitua `https://github.com/seu-usuario/phishing-detector.git` pelo URL real do seu repositório, se aplicável. Se não tiver um repositório, extraia o arquivo ZIP na pasta `phishing-detector`.)

### Passo 2: Configurar e Rodar o Backend
O backend, baseado em FastAPI, é responsável por analisar as URLs e determinar se são seguras, suspeitas ou perigosas.

1. **Instale as Dependências do Backend**:
   - Navegue até a pasta `backend`:
     ```bash
     cd backend
     ```
   - Instale as dependências listadas no `requirements.txt`:
     ```bash
     pip install -r requirements.txt
     ```
   - Dependências incluídas no `requirements.txt`:
     ```
     annotated-types==0.7.0
     anyio==4.9.0
     beautifulsoup4==4.12.3
     certifi==2025.4.26
     charset-normalizer==3.4.2
     click==8.2.0
     colorama==0.4.6
     fastapi==0.115.12
     filelock==3.18.0
     h11==0.16.0
     idna==3.10
     lxml==5.3.0
     pydantic==2.11.4
     pydantic_core==2.33.2
     python-Levenshtein==0.25.1
     python-whois==0.9.4
     requests==2.32.3
     requests-file==2.1.0
     sniffio==1.3.1
     starlette==0.46.2
     tldextract==5.3.0
     typing-inspection==0.4.0
     typing_extensions==4.13.2
     urllib3==2.4.0
     uvicorn==0.34.2
     ```

2. **Rode o Backend**:
   - Certifique-se de estar na pasta `backend`.
   - Inicie o servidor FastAPI usando `uvicorn`:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - O backend estará disponível em `http://localhost:8000/checkurl`. Mantenha o terminal aberto enquanto usa a extensão ou o frontend.

3. **Teste o Backend** (Opcional):
   - Verifique se o endpoint está funcionando com:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com"}' http://localhost:8000/checkurl
     ```
   - A resposta deve ser um JSON com os campos de análise (e.g., `is_in_openphish`, `has_number_substitution`, etc.).

### Passo 3: Instalar a Extensão no Firefox
1. **Habilite o Modo de Depuração**:
   - Abra o Firefox e digite `about:debugging#/runtime/this-firefox` na barra de endereço.
   - Certifique-se de que a opção "Habilitar carregamento de extensões temporárias" está ativa.

2. **Carregue a Extensão**:
   - Clique em "Carregar Extensão Temporária".
   - Selecione o arquivo "manifest.json" dentro da pasta "phishing-detector-plugin/".
   - O Firefox carregará a extensão, e o ícone aparecerá na barra de ferramentas.

### Passo 4: Configurar e Testar
1. **Configure as Opções da Extensão**:
   - Clique no ícone da extensão na barra de ferramentas para abrir o pop-up.
   - Clique em "Configurações" para abrir a página de opções em uma nova aba.
   - Aqui, você pode configurar a extensão conforme sua preferência:
     - Ative o "Enable automatic blocking of dangerous sites" para bloquear automaticamente sites perigosos.
     - Ajuste os thresholds (e.g., Suspicious Threshold: 4, Dangerous Threshold: 7) para definir os limites de pontuação para sites suspeitos e perigosos.
     - Adicione domínios à whitelist, se necessário (um por linha), para ignorar a análise em sites confiáveis.

2. **Teste a Extensão**:
   - Acesse uma URL (e.g., `https://example.com`) para verificar se uma notificação aparece indicando se o site é seguro, suspeito ou perigoso.
   - Clique na notificação para abrir uma janela com uma visualização detalhada dos critérios de análise, incluindo o que foi considerado seguro e o que não.
   - No Gmail (`https://mail.google.com`), abra um e-mail com links e passe o mouse sobre eles para testar a análise, uma notificação aparecerá ao passar o mouse, e você pode clicar para ver os detalhes.
   - Recarregue uma página para confirmar que notificações aparecem a cada recarregamento.

### Passo 5 (Se Quiser Ter uma Visualização e Feedback Melhor): Configurar e Rodar o Frontend
O frontend é uma aplicação React construída com Vite, onde os usuários podem inserir uma URL e receber dados detalhados sobre o nível de segurança.

1. **Instale as Dependências do Frontend**:
   - Navegue até a pasta `frontend`:
     ```bash
     cd frontend
     ```
   - Instale as dependências usando `npm`:
     ```bash
     npm install
     ```

2. **Rode o Frontend**:
   - Inicie o servidor de desenvolvimento com:
     ```bash
     npm run dev
     ```
   - O frontend estará disponível em `http://localhost:3000` (ou outra porta, dependendo da configuração do Vite). A URL exata será exibida no terminal.
   - Abra o endereço no navegador para acessar a interface.

3. **Teste o Frontend**:
   - Insira uma URL no campo fornecido (e.g., `https://example.com`).
   - O frontend deve fazer uma requisição ao backend (`http://localhost:8000/checkurl`) e exibir os dados de segurança (e.g., score, detalhes de análise).

### Dicas de Depuração
- **Console do Firefox**: Use `Ctrl+Shift+J` para abrir o console e verificar logs da extensão (e.g., "📊 Score de risco:", "❌ Erro ao verificar URL:").
- **Console do Frontend**: Abra o console do navegador (F12) na página do frontend para verificar erros de rede ou JavaScript.
- **Backend**: Se não houver notificações ou dados no frontend, confirme que o backend está rodando e testável com `curl`.
- **Recarregamento**: Se a extensão parar de funcionar, remova e recarregue-a em `about:debugging`.