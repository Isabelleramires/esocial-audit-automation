# Como executar a demonstração no Google Sheets

**O projeto é uma demonstração independente e usa somente dados fictícios.** Não conecte essa versão a planilhas operacionais.

## Importar o código

1. No Google Drive, crie uma **planilha nova e vazia**, dedicada aos testes.
2. Abra **Extensões → Apps Script**.
3. No editor, substitua ou exclua o conteúdo inicial do arquivo `Código.gs`.
4. Para **cada um dos oito arquivos `.gs`** da pasta `src/`, crie um arquivo de script no Apps Script com o mesmo nome e cole o conteúdo.
5. Salve o projeto. O arquivo `src/appsscript.json` documenta as configurações de runtime, mas não precisa ser importado manualmente no processo básico.
6. Volte à planilha e atualize a página para exibir o menu **Auditoria Demo**.

## Executar o fluxo

1. Acesse **Auditoria Demo → 1. Preparar estrutura demonstrativa**. Autorize o script, se solicitado. Como existe uma função opcional de exportação, o Google pode pedir também permissão para o Drive.
2. Aguarde a criação das abas `ENTRADA ASO`, `RETORNOS SIMULADOS`, três abas de auditoria, `BASE GERAL` e `DASHBOARD`.
3. Clique em **2. Gerar auditoria semanal** ou **3. Gerar auditoria mensal**.
4. Acesse as abas de auditoria e `DASHBOARD`. A auditoria considera datas até hoje, então os dados fictícios são gerados em relação à data atual.
5. Para testar a atualização, altere o retorno de um identificador `DEMO-*` em `RETORNOS SIMULADOS` e use **4. Atualizar retornos simulados**.
6. Você pode preencher **Observações** e **Status tratativa** nas abas de auditoria. A atualização dos retornos preserva observações e não rebaixa registros já confirmados com recibo fictício.
7. **6. Exportar Base Geral CSV** é opcional. Essa ação cria um CSV na sua conta do Google Drive.

## Subir no GitHub

O ZIP deste projeto já contém o `README.md` na raiz. **Extraia o ZIP e envie seu conteúdo**, mantendo as pastas `src/`, `docs/` e `tests/` e o README no primeiro nível. Não é necessário subir o PDF privado de referência nem qualquer documentação operacional.

## Testes locais

Se tiver Node.js instalado, abra um terminal na pasta do projeto e execute:

```bash
npm test
```

Os testes não usam contas Google e não entram em contato com serviços externos.

## Avisos

- Os exemplos de eventos e retornos são **ilustrativos** e não substituem validação oficial de eSocial.
- Nada nesse projeto deve ser usado para processar dados reais ou demonstrar um serviço em produção.
- A implantação no Google Apps Script ainda precisa ser conferida na sua própria conta; não se trata de uma solução pronta para uso empresarial.
