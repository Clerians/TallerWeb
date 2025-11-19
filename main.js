const resourcesContainer = document.getElementById('resources');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const closeDetail = document.getElementById('closeDetail');
const apiButtons = document.querySelectorAll('.api-btn');

closeDetail.addEventListener('click', () => {
  detailModal.classList.add('hidden');
});

detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    detailModal.classList.add('hidden');
  }
});

async function fetchRecetas() {
  try {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken');
    const data = await res.json();

    return data.meals.slice(0, 9).map(meal => {
      let ingredientes = "";
      for (let i = 1; i <= 20; i++) {
        const ingrediente = meal[`strIngredient${i}`];
        const medida = meal[`strMeasure${i}`];
        if (ingrediente && ingrediente.trim() !== "") {
          ingredientes += `<li>${medida ? medida : ""} ${ingrediente}</li>`;
        }
      }

      return {
        titulo: meal.strMeal,
        imagen: meal.strMealThumb,
        descripcion: "", 
        extra: "",      
        detalles: `
          <h2>${meal.strMeal}</h2>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <p><strong>Ingredientes:</strong></p>
          <ul>
            ${ingredientes}
          </ul>
          <p><strong>Instrucciones:</strong> ${meal.strInstructions}</p>
        `
      };
    });
  } catch (error) {
    console.error("Error TheMealDB:", error);
    return [];
  }
}


async function fetchPokemon() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=898");
    const data = await res.json();

    const randomPokemons = Array.from({ length: 9 }, () => {
      return data.results[Math.floor(Math.random() * data.results.length)];
    });

    const requests = randomPokemons.map(p => fetch(p.url).then(r => r.json()));
    const pokemons = await Promise.all(requests);

    return pokemons.map(p => ({
      titulo: p.name,
      imagen: p.sprites.other?.["official-artwork"]?.front_default || p.sprites.front_default,
      descripcion: `ID: ${p.id}`,
      extra: `Peso: ${p.weight} | Altura: ${p.height}`,
    }));
  } catch (error) {
    console.error("Error al cargar los Pokémon:", error);
    return [];
  }
}


async function fetchGatos() {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/images/search?limit=9");
    const data = await response.json();

    return data.map(gato => {
      return {
        titulo: "Gato",
        imagen: gato.url,
        descripcion: `Raza: Adorable`,
        extra: "Si es naranjo no confie",
      };
    });
  } catch (error) {
    console.error("Error al obtener los gatos:", error);
    return [];
  }
}

async function fetchPerros() {
  try {
    const res = await fetch("https://dog.ceo/api/breeds/image/random/9");
    const data = await res.json();
    return data.message.map(url => {
      const partes = url.split("/");
      const raza = partes[4];
      return {
        titulo: raza,
        imagen: url,
        descripcion: `Raza: ${raza}`,
        extra: "No importa la raza, todos son adorables",
      };
    });
  } catch (error) {
    console.error("Error al obtener los perros:", error);
    return [];
  }
}

function renderCards(items) {
  resourcesContainer.innerHTML = '';
  if (!items.length) {
    resourcesContainer.innerHTML = `<p>No hay datos para mostrar</p>`;
    return;
  }

  const template = document.getElementById('cardTemplate');

  items.forEach(item => {
    const card = template.content.cloneNode(true);
    const div = card.querySelector('.card');
    const img = card.querySelector('img');
    const h3 = card.querySelector('h3');

    if (item.imagen) {
      img.src = item.imagen;
      img.alt = item.titulo;
    } else {
      img.remove();
    }

    h3.textContent = item.titulo;

    div.addEventListener('click', () => {
      detailContent.innerHTML = item.detalles || `
        <h2>${item.titulo}</h2>
        ${item.imagen ? `<img src="${item.imagen}" alt="${item.titulo}">` : ''}
        <p>${item.descripcion}</p>
        ${item.extra ? `<p>${item.extra}</p>` : ''}
      `;
      detailModal.classList.remove('hidden');
    });

    resourcesContainer.appendChild(card);
  });
}


apiButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const api = button.dataset.api;
    resourcesContainer.innerHTML = `<p>Cargando datos...</p>`;
    let items = [];
    switch (api) {
      case 'recetas':
        items = await fetchRecetas();
        break;
      case 'pokemons':
        items = await fetchPokemon();
        break;
      case 'gatos':
        items = await fetchGatos();
        break;
      case 'perros':
        items = await fetchPerros();
        break;
    }
    renderCards(items);
  });
});


