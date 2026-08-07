module.exports = {
  version: "1.5",
  title: "Ptah & Kokoro TTS",
  description: "Entorno local de Rol con IA y Narrador de Voz Neuronal Kokoro TTS",
  icon: "public/favicon.ico",
  menu: async (kernel) => {
    let installed = await kernel.exists("env") && await kernel.exists("node_modules");
    if (installed) {
      return [
        {
          default: true,
          icon: "fa-solid fa-power-off",
          text: "Iniciar Aplicación",
          href: "start.json"
        },
        {
          icon: "fa-solid fa-rotate",
          text: "Actualizar Código/Dependencias",
          href: "update.json"
        },
        {
          icon: "fa-solid fa-circle-xmark",
          text: "Reinstalar / Restablecer",
          href: "reset.json"
        }
      ]
    } else {
      return [
        {
          default: true,
          icon: "fa-solid fa-plug",
          text: "Instalar Dependencias",
          href: "install.json"
        }
      ]
    }
  }
}
