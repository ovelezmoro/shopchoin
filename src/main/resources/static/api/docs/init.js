/* La URL relativa respeta el context-path del backend y el puerto actual. */
const apiBase = new URL('.', window.location.href);

window.ui = SwaggerUIBundle({
    url: new URL('openapi.yml', apiBase).href,
    dom_id: '#swagger-ui',
    deepLinking: true,
    validatorUrl: null,
    presets: [SwaggerUIBundle.presets.apis]
});
