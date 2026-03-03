const sharp = require('sharp');
const fs = require('fs');

const files = ['Planta.png', 'guacamaya.png', 'Jaguar.png', 'TEXTO_PRINCIPAL.png', 'TEXTO_INFERIOR.png'];

files.forEach(f => {
  sharp(`public/assets/${f}`)
    .webp({ quality: 75 })
    .toFile(`public/assets/${f.replace('.png', '.webp')}`)
    .then(() => console.log(`Converted ${f} to webp`))
    .catch(console.error);
});
