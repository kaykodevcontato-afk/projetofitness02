# FITNESS PRO — projeto HTML preparado para APK Android

Aplicativo offline-first em HTML/CSS/JavaScript, empacotado com Capacitor.

## O que já está incluído
- Treinos por modalidade (academia, rua, casa e calistenia), com criação, edição e exclusão.
- Registro de duração, data e lista de exercícios.
- Objetivo: ganhar massa muscular ou perder peso.
- Controle diário de água e meta personalizável.
- Corrida com GPS e gravação local de pontos, distância e duração.
- Histórico de corridas e exportação individual de percurso.
- Backup JSON completo e importação/compartilhamento pelo seletor nativo do Android.
- Dados guardados localmente no dispositivo (localStorage).

## Requisitos para compilar
- Node.js LTS e npm
- Android Studio + Android SDK
- JDK compatível com a versão do Android Gradle Plugin instalada pelo Capacitor

## Gerar o APK
Abra um terminal nesta pasta e execute:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
O APK de debug normalmente fica em `android/app/build/outputs/apk/debug/app-debug.apk`.

Para atualizar o app depois de editar o HTML/JS:
```bash
npm run build
npx cap sync android
```

## GPS e modo offline
No Android, o app usa o plugin nativo `@capacitor/geolocation` e solicitará permissão de localização. O GPS funciona sem dados móveis, desde que o aparelho consiga receber sinal de satélite e a permissão esteja concedida. A precisão pode variar em ambientes fechados.
O registro do percurso é salvo no próprio aparelho. Este pacote não baixa mapas offline: a visualização de mapas/tiles do Google Maps exige internet e uma integração adicional com chave/API do Google Maps.

## Backup
Na aba **Mais**, escolha **Exportar backup**. O Android permite salvar ou compartilhar o JSON por aplicativos disponíveis, como Drive ou WhatsApp. Para restaurar, selecione o arquivo em **Importar backup**. A importação substitui os dados atuais; faça backup antes.

## Observações importantes
- Este é o código-fonte pronto para compilar, não um APK já compilado.
- Os dados ficam no armazenamento local do app. Desinstalar o aplicativo pode apagar os dados locais; mantenha backups externos.
- Para distribuição pública, configure assinatura de release no Android Studio.

## Compilar sem Android Studio usando GitHub Actions (inclusive pelo celular)
1. Crie uma conta gratuita no GitHub, se ainda não tiver.
2. Crie um repositório novo e envie todos os arquivos desta pasta (extraídos do ZIP), incluindo a pasta oculta `.github/workflows`.
3. Abra a aba **Actions** do repositório e permita executar workflows, se o GitHub solicitar.
4. Selecione **Build FITNESS PRO APK** e toque em **Run workflow**.
5. Quando terminar com sucesso, abra a execução concluída e baixe o artefato **FITNESS-PRO-debug-apk**. Dentro do ZIP baixado estará `app-debug.apk`.

O workflow usa os servidores do GitHub para instalar as ferramentas Android e compilar. Não é necessário instalar Android Studio no celular. O APK gerado é de depuração (debug), adequado para instalação e testes; para publicação na Play Store será necessária uma assinatura de release.
