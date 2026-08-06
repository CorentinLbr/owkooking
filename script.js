// On vient récupérer les 6 éléments HTML sur lesquels on va travailler puis on les stocke dans des constantes pour ne pas refaire getElementById à chaque fois.
const listeEl = document.getElementById('liste');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const typeplatEl = document.getElementById('type_plat');
const overlay = document.getElementById('overlay');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('close');

// Elle prend en paramètre un tableau de recettes à afficher, et commence par vider la liste et si le tableau est vide on arrete
function render(recettes) {
  listeEl.innerHTML = '';
  if (recettes.length === 0) {
    listeEl.innerHTML = '<li class="empty">Aucune recette trouvée.</li>';
    return;
  }
  
  recettes.forEach(function (recette) { // Sinon, on boucle sur chaque recette du tableau RECETTES (base de donnée)
    // Pour chaque recette, on crée dynamiquement un <li> et un <button>
    const li = document.createElement('li');
    const btn = document.createElement('button');
    
    const titreSpan = document.createElement('span'); // création <span> pour le titre
    titreSpan.className = 'titre'; // nommage de la classe
    titreSpan.textContent = recette.titre; // on récupérer le titre de la recette depuis la base de donnée

    const typeSpan = document.createElement('span');
    typeSpan.className = 'type';
    typeSpan.textContent = recette.type_recette;

    // On insère les deux <span> dans le bouton, puis on ajoute un écouteur de clic
    btn.appendChild(titreSpan);
    btn.appendChild(typeSpan);
    btn.addEventListener('click', function () { openModal(recette); }); // quand on clique sur ce bouton précis, on appelle openModal()

    // On met le bouton dans le <li>, puis le <li> dans la liste <ul> affichée à l'écran
    li.appendChild(btn);
    listeEl.appendChild(li);
  });
}

function openModal(recette) {
  let ingHtml = '<ul class="ing">' + recette.ingredients.map(function (i) {  // .map() transforme chaque objet {nom, quantite, unite} en une chaîne <li>...</li>.
    // Assemble quantité + unité (en ignorant l'unité si elle vaut "-") et .filter(Boolean) retire les valeurs vides avant de les joindre avec un espace.
    const qte = [i.quantite, (i.unite && i.unite !== '-') ? i.unite : ''].filter(Boolean).join(' '); 
    // colle tous les <li> ensemble sans séparateur.
    return '<li>' + (qte ? '' + qte + ' ' : '') + i.nom + '</li>';
  }).join('') + '</ul>';

  let stepsHtml = '<ol class="steps">' + recette.instructions.map(function (step) {
    return '<li>' + step + '</li>';
  }).join('') + '</ol>';

  // On assemble tout le contenu de la fiche recette et on l'injecte dans modalContent
  modalContent.innerHTML =
    '<h2>' + recette.titre + '</h2>' +
    '<div class="meta">Temps de préparation : ' + (recette.temps_prepa) + 'h</div>' +
    '<div class="meta">Pour : ' + (recette.Personne) + ' personnes</div>' +
    '<img class="image_recette" src="photos/' + recette.image + '" alt="' + recette.titre + '">' +
    '<h3>Ingrédients</h3>' + ingHtml +
    '<h3>Préparation</h3>' + stepsHtml;

  // On ajoute la classe CSS open à l'overlay, ce qui le rend visible (voir .overlay.open { display: flex; } dans style.css).
  overlay.classList.add('open');
}

// Fermeture de la modale ou via la x ou via un click or fenetre
closeBtn.addEventListener('click', function () { overlay.classList.remove('open'); });
overlay.addEventListener('click', function (e) {
  if (e.target === overlay) overlay.classList.remove('open');
});

// La recherche
searchEl.addEventListener('input', function () {
  const q = searchEl.value.trim().toLowerCase(); // on nettoie le texte input
  const filtered = RECETTES.filter(function (r) { // on retient les recettes dont le titre contient q
    return r.titre.toLowerCase().includes(q);
  });
  countEl.textContent = filtered.length + ' recette' + (filtered.length > 1 ? 's' : ''); // on met à jour le compteur (+avec un "s" au pluriel si besoin)
  render(filtered); // on ré-affiche la liste filtrée via render()
});

// Filtre recette
const boutons = document.querySelectorAll("#filtres button"); // Récupère tous les boutons présents dans le conteneur #filtres
let boutonActif = null;                         // Variable qui mémorise le bouton actuellement actif.
boutons.forEach(btn => {                        // Pour chaque bouton de filtre...
    btn.addEventListener("click", () => {       // ...on ajoute un évènement qui se déclenche lors d'un clic.
        if (btn === boutonActif) {              // Si l'utilisateur clique sur le bouton déjà actif...
            btn.classList.remove("active");     // ...on retire son apparence "active".
            boutonActif = null;                 // ...et on indique qu'il n'y a plus de filtre sélectionné.
        } else {
            boutons.forEach(b => b.classList.remove("active"));   // Sinon, on retire la classe "active" de tous les boutons
            btn.classList.add("active");                          // On applique la classe "active" au bouton cliqué
            boutonActif = btn;                                     // On mémorise ce bouton comme étant le filtre actif.
        }
        const type = boutonActif ? boutonActif.dataset.type.toLowerCase() : "";
        const filtered = RECETTES.filter(r =>
            type === "" ||
            r.type_recette.toLowerCase().includes(type)
        );

        countEl.textContent = filtered.length + ' recette' + (filtered.length > 1 ? 's' : '');
        render(filtered);
    });
});

// Main
RECETTES.sort(function (a, b) { return a.titre.localeCompare(b.titre, 'fr'); }); // Au chargement de la page : on trie RECETTES (qui doit etre ouvert avant ce script) par ordre alphabétique
countEl.textContent = RECETTES.length + ' recettes'; // on affiche le nombre total
render(RECETTES); // on appel render
