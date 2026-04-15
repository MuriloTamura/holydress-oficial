// Controle do menu hambúrguer no mobile
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    
    // Criar ícone do menu hambúrguer se não existir
    let menuIcon = document.getElementById('menu-icon');
    
    if (menuIcon) {
        // Função para abrir/fechar menu
        function toggleMenu(e) {
            e.stopPropagation();
            nav.classList.toggle('active');
            
            // Trocar ícone entre menu e X
            if (nav.classList.contains('active')) {
                menuIcon.className = 'bx bx-x';
            } else {
                menuIcon.className = 'bx bx-menu';
            }
        }

        // Adicionar evento de clique no ícone
        menuIcon.addEventListener('click', toggleMenu);

        // Fechar menu ao clicar em um link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuIcon.className = 'bx bx-menu';
            });
        });

        // Fechar menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !menuIcon.contains(e.target)) {
                nav.classList.remove('active');
                menuIcon.className = 'bx bx-menu';
            }
        });
    }
});

// Atualização do header baseado na seção (código original mantido)
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
const header = document.querySelector("header");
const logo = document.querySelector(".logo img");

function updateHeaderOnScroll() {
  let atual = "";

  sections.forEach(sec => {
    const topo = sec.offsetTop - 100;
    const altura = sec.clientHeight;

    if (window.pageYOffset >= topo && window.pageYOffset < topo + altura) {
      atual = sec.getAttribute("id");
    }
  });

  navLinks.forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === `#${atual}`) {
      a.classList.add("active");
    }
  });

  // Remove TODAS as classes primeiro
  header.classList.remove("light-header", "dark-header");

  // Adiciona a classe apropriada baseado na seção
  if (atual === "novidades" || atual === "modelos") {
    header.classList.add("light-header");
    if (logo) logo.src = "./images/logo-preta.png";
  } else if (atual === "about") {
    header.classList.add("dark-header");
    if (logo) logo.src = "./images/logo.png";
  } else {
    if (logo) logo.src = "./images/logo.png";
  }
}

window.addEventListener("scroll", updateHeaderOnScroll);
window.addEventListener("DOMContentLoaded", updateHeaderOnScroll);