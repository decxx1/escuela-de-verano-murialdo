# Escuela de Verano Murialdo · Astro

Sitio estático con Astro 7.3, React 19.3, Tailwind 4.3, Vite 8 y PhotoSwipe. Los contenidos se obtienen del CMS headless Laravel durante el build; ya no se consulta la API deshabilitada de Strapi. El HTML del CMS usa estilos propios en `src/styles/global.css`, sin `@tailwindcss/typography`.

## Inicio local con Bun

Iniciar PostgreSQL 17 de Laragon. En una terminal, desde `../../cms-headless`:

```sh
bun run serve
```

En otra terminal, desde esta carpeta:

```sh
bun install --frozen-lockfile
bun run dev
```

Frontend: [http://127.0.0.1:4321](http://127.0.0.1:4321). CMS: [http://127.0.0.1:8000/control](http://127.0.0.1:8000/control). No hace falta Docker. Se requiere Node >=22.12.0 para Astro; Bun 1.4.2 administra dependencias y scripts. Laravel se ejecuta con PHP/Artisan.

El `.env.example` documenta la configuración. Los valores predeterminados funcionan con el CMS local de este equipo:

```dotenv
CMS_URL=http://127.0.0.1:8000
CMS_SITE=escuela-de-verano
CMS_TOKEN=
```

Estas variables sólo se usan en el servidor de desarrollo/build. No poner un token en una variable `PUBLIC_*`. El sitio local tiene lectura pública habilitada para servir imágenes a los visitantes. Los medios de sitios privados requieren autorización; esta integración no copia medios privados al build.

## Contenido recuperado

La base local contiene lo publicado en `https://escueladeveranomurialdo.com.ar/`: **9 noticias completas, 4 álbumes con 450 fotos, 19 actividades, 6 preguntas frecuentes, 2 divisiones por edad, contacto y configuración**. Las 459 imágenes originales están almacenadas en Laravel, con miniaturas locales para los listados. Los enlaces históricos de noticias y álbumes, sus fechas y el orden de las fotos se conservaron.

Equipo, precios e inscripciones mantienen el estado deshabilitado/cerrado visible en la web publicada. No se inventaron datos ocultos ni se recuperaron usuarios o borradores de Strapi. El comando de recuperación y los respaldos se documentan en el README del CMS.

El diseño y las imágenes estáticas siguen en este proyecto. Los íconos de actividades son identificadores del CMS que se resuelven a trazados SVG saneados en `src/assets/activity-icons.json`, no HTML arbitrario. Noticias, actividades y preguntas muestran el HTML seguro que produce Laravel desde Markdown.

El propietario puede configurar Cloudflare R2 en **Almacenamiento** del CMS y copiar allí los medios locales. Astro mantiene las mismas URLs: Laravel autoriza cada lectura y redirige a R2 con una firma nueva, por lo que el build no contiene enlaces temporales que caduquen ni credenciales de Cloudflare. La copia a R2 no cambia los enlaces ya construidos; publicar noticias o cambiar su contenido sí requiere un nuevo build.

## Build y actualización

```sh
bun run build
bun run preview
```

El build necesita un CMS accesible y publicaciones vigentes. Si falla la API, la compilación falla explícitamente: no genera silenciosamente un sitio sin noticias/fotos. El cliente comparte un único snapshot para evitar una consulta por cada componente o noticia. En desarrollo renueva el snapshot después de unos segundos al navegar; los cambios se muestran sólo después de publicar en el CMS.

`@astrojs/sitemap` genera `dist/sitemap-index.xml` y `dist/sitemap-0.xml` automáticamente a partir de las páginas construidas, incluidas todas las noticias (`/blog/[slug]`) y los álbumes (`/galeria/[slug]`) publicados en el CMS. Las URLs usan `https://escueladeveranomurialdo.com.ar` y coinciden con los canonical sin barra final. `src/pages/robots.txt.ts` genera `dist/robots.txt` desde `site`, permite el rastreo público y anuncia el índice del sitemap. Publicar o despublicar contenido requiere otro build para actualizar tanto las páginas como el sitemap.

En producción, configurar `CMS_URL` con la URL HTTPS pública del CMS: las URLs de imágenes deben ser accesibles también desde el navegador del visitante, no sólo desde la máquina de build. Cambiar contenido en Laravel requiere un nuevo build/despliegue de Astro; todavía no hay webhook automático. No desplegar un build con URLs de medios apuntando a `127.0.0.1`.

El formulario de contacto conserva su proveedor externo y sus variables existentes (`SITE_KEY`, `ENDPOINT`, `SECRET_KEY`); el envío de correo no se migró al CMS. No se enviaron formularios durante la recuperación.

## Pruebas

```sh
bun run test
bun run check
bun run build
```

Las pruebas cubren snapshot compartido, errores/reintentos, separación de tokens, validación de sitio/preview, adaptación de los tipos, galerías extensas sin truncar y noticias sin los límites de paginación del cliente anterior.
