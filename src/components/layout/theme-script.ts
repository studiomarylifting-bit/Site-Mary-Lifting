/** Roda antes da pintura: aplica o tema salvo e evita o "flash" claro ao abrir no escuro. */
export const themeInitScript = `try{var m=localStorage.getItem("ml-theme");if(m==="light"||m==="dark")document.documentElement.setAttribute("data-theme",m)}catch(e){}`;
