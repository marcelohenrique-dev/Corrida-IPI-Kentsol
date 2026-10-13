# Kentsol

Site institucional da Kentsol, com informações sobre soluções de aquecimento de água para banho e piscina e formulário de cadastro para sorteio.

## Páginas

- `index.html` — página inicial e links para os serviços e o sorteio.
- `NossosServiços.html` — soluções, equipamentos e contatos.
- `sorteio.html` — inscrição do sorteio; requer a configuração técnica da integração com o Google Sheets.
- `privacidade.html` — Política de Privacidade aprovada para a campanha.
- `google-apps-script/Code.gs` — endpoint de gravação das inscrições no Google Sheets.

## Como visualizar

Abra `index.html` em um navegador. Não é necessário instalar dependências.

O visualizador 3D de equipamentos e as fontes podem precisar de conexão com a internet.

## Configuração da planilha do sorteio

O endpoint `/exec` fornecido está configurado em `sorteio.html`. A Política de Privacidade está aprovada. Antes de receber inscrições, confirme que o Apps Script implantado tem o código de `google-apps-script/Code.gs`, as propriedades da planilha e as permissões corretas; em seguida, faça um teste real de envio.

1. Abra a planilha que receberá as inscrições e confirme a aba de destino. O `gid=0` da URL fornecida corresponde ao ID inicial da aba; confirme esse valor na própria planilha.
2. No Google Sheets, abra **Extensões > Apps Script** e copie `google-apps-script/Code.gs` para o projeto.
3. Em **Configurações do projeto > Propriedades do script**, configure `SPREADSHEET_ID` com o ID da planilha e `SHEET_TAB_ID` com o ID numérico (`gid`) da aba de respostas.
4. Use uma aba vazia dedicada ou uma aba cuja primeira linha já tenha exatamente os cabeçalhos definidos em `Code.gs`. O script não sobrescreve cabeçalhos diferentes.
5. Implante como **App da web**, executando como a conta proprietária da planilha. A URL `/exec` recebida já está configurada na constante `GOOGLE_APPS_SCRIPT_URL` em `sorteio.html`.
6. Antes de abrir inscrições ao público, faça um teste controlado e confirme que a linha e as autorizações opcionais foram registradas corretamente.

Um app da web acessível publicamente pode receber envios automatizados. O script valida as respostas, usa um campo honeypot e serializa gravações, mas a empresa deve monitorar a planilha e confirmar se precisa de medidas adicionais contra abuso antes de divulgar o formulário.

## Política de Privacidade

`privacidade.html` contém a Política de Privacidade aprovada pela Kentsol para esta campanha.

## Verificação mobile local

Abra o site no navegador e use as ferramentas de desenvolvimento para testar as larguras de 320, 360, 375, 390, 414 e 430 px, além de tablet e desktop. Confira os links entre Início, Serviços, Sorteio e Privacidade; na página de Serviços, verifique também os modelos 3D. No sorteio, teste a validação das respostas, a abertura do regulamento e os consentimentos antes de configurar o envio real.

## Organização dos arquivos visuais

- `images/` — logotipos e imagens do reservatório térmico, incluindo a variante WebP otimizada usada pela página de serviços.
- `sections/` — imagens de destaque e apoio; as páginas usam variantes WebP otimizadas quando disponíveis.
- `collector/` — imagens, modelo de origem e configurações do coletor solar.
- `heat-pump/` — modelos e imagens do trocador de calor; `Trocador/` contém as texturas usadas pelo modelo OBJ.
