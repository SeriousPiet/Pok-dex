import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FooterComponent } from './footer/footer.component';
import Pokedex from 'pokedex-promise-v2';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, NavBarComponent, FooterComponent],
  styleUrls: ['./landing-page.component.scss'],

  template: ` <section>
    <app-nav-bar></app-nav-bar>
    <div style="display: flex; width: 100%">
      <div id="cardFilter"></div>
      <div id="pokemonContainer"></div>
    </div>
    <div id="pokemonDetailsContainer"></div>
    <div id="mobileScreen">
      <div>
        <img id="rotateDeviceImage" src="../assets/img/rotate_device.gif" />
      </div>
      <div>
        <p style="color: white;">
          Um den Pokedex nutzen zu können, bitte das Gerät drehen.
        </p>
      </div>
    </div>
    <app-footer></app-footer>
  </section>`,
})
export class LandingPageComponent implements OnInit {
  constructor() {
    this.setFilter = this.setFilter.bind(this);
  }

  async ngOnInit(): Promise<void> {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    this.checkForBrowserSystem(isLandscape);
    this.renderPokemonTypeFilter();
    await this.getData();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    this.checkForBrowserSystem(!isLandscape);
  }

  checkForBrowserSystem(isLandscape: any) {
    const mobileScreen = document.getElementById('mobileScreen');
    if (!mobileScreen) {
      return;
    }
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      if (isLandscape) {
        mobileScreen.classList.add('show');
      } else {
        mobileScreen.classList.remove('show');
      }
    }
  }

  async getData(): Promise<void> {
    const pokedex = new Pokedex();
    const promises: Promise<Pokedex.Pokemon>[] = [];
    try {
      for (let i = 1; i <= 151; i++) {
        promises.push(pokedex.getPokemonByName(i));
      }
      const pokemonDataList = await Promise.all(promises);
      pokemonDataList.forEach((data) => {
        this.renderPokemonData(data);
        this.renderPokemonDetails(data);
      });
    } catch (error) {
      console.error(error);
    }
  }

  renderPokemonTypeFilter() {
    const cardFilter = document.getElementById('cardFilter');
    const typeArray = [
      'All',
      'all',
      'Grass',
      'grass',
      'Fire',
      'fire',
      'Water',
      'water',
      'Bug',
      'bug',
      'Normal',
      'normal',
      'Poison',
      'poison',
      'Electric',
      'electric',
      'Ground',
      'ground',
      'Fairy',
      'fairy',
      'Fighting',
      'fighting',
      'Psychic',
      'psychic',
      'Rock',
      'rock',
      'Ghost',
      'ghost',
      'Ice',
      'ice',
      'Dragon',
      'dragon',
    ];
    if (!cardFilter) {
      return;
    }
    for (let i = 0; i < typeArray.length; i += 2) {
      const type = typeArray[i];
      const labelElement = document.createElement('label');
      const inputElement = document.createElement('input');
      inputElement.setAttribute('type', 'checkbox');
      inputElement.setAttribute('value', typeArray[i + 1]);
      if (type === 'All') {
        inputElement.checked = true;
      }
      labelElement.appendChild(inputElement);
      labelElement.appendChild(document.createTextNode(type));
      cardFilter.appendChild(labelElement);
    }
    this.checkboxChangeControl();
  }

  checkboxChangeControl() {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      '#cardFilter input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (event: any) => {
        if (event.target.value === 'all') {
          checkboxes.forEach((cb) => {
            if (cb !== event.target) {
              cb.checked = false;
            }
          });
        } else {
          const allCheckbox = document.querySelector<HTMLInputElement>(
            '#cardFilter input[value="all"]'
          );
          if (allCheckbox) {
            allCheckbox.checked = false;
          }
        }
        this.setFilter();
      });
    });
  }

  setFilter() {
    const checkedCheckboxes = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        '#cardFilter input[type="checkbox"]:checked'
      )
    );
    const selectedType = checkedCheckboxes.map((checkbox) => checkbox.value);
    if (checkedCheckboxes.length === 0 || selectedType[0] === 'all') {
      const allCheckbox = document.querySelector<HTMLInputElement>('input[value="all"]');
      if (allCheckbox) {
          allCheckbox.checked = true;
      }
      this.loadCardFilter('all');
    } else {
      this.loadCardFilter(selectedType);
    }
  }

  loadCardFilter(selectedTypes: string | string[]) {
    const pokemonContainer = document.getElementById(
      'pokemonContainer'
    ) as HTMLDivElement;
    if (!pokemonContainer) {
      return;
    }
    const pokemonCards = pokemonContainer.getElementsByClassName('pokemonCard');
    for (let i = 0; i < pokemonCards.length; i++) {
      const pokemonCard = pokemonCards[i] as HTMLDivElement;
      const pokemonType = pokemonCard.classList[0];
      if (Array.isArray(selectedTypes)) {
        if (
          selectedTypes.includes('all') ||
          selectedTypes.includes(pokemonType)
        ) {
          pokemonCard.style.display = 'flex';
        } else {
          pokemonCard.style.display = 'none';
        }
      } else {
        if (selectedTypes === 'all' || selectedTypes === pokemonType) {
          pokemonCard.style.display = 'flex';
        } else {
          pokemonCard.style.display = 'none';
        }
      }
    }
  }

  renderPokemonData(data: Pokedex.Pokemon) {
    const pokemonContainer = document.getElementById('pokemonContainer');
    const pokemonCard = this.createPokemonCard(data);
    const pokemonImage = this.createPokemonImage(data);
    const pokemonType = this.createPokemonType(data);
    if (!pokemonCard || !pokemonImage || !pokemonContainer || !pokemonType) {
      console.error('Failed to create Pokemon card, image or div');
      return;
    }
    pokemonCard.appendChild(pokemonImage);
    pokemonCard.appendChild(pokemonType);
    pokemonContainer.appendChild(pokemonCard);
  }

  createPokemonCard(data: Pokedex.Pokemon) {
    const pokemonCard = document.createElement('div');
    const ID = 'ID' + data.id;
    pokemonCard.classList.add(data.types[0].type.name);
    pokemonCard.classList.add('pokemonCard');
    pokemonCard.id = 'Nr' + data.id;
    pokemonCard.addEventListener('click', () => {
      this.showPokemonDetails(ID);
    });
    this.addHoverEffect(pokemonCard);
    return pokemonCard;
  }

  createPokemonImage(data: Pokedex.Pokemon) {
    const pokemonImage = document.createElement('img');
    if (data.sprites.front_default !== null) {
      pokemonImage.src = data.sprites.front_default;
    } else {
      console.error('Front default sprite not found for', data.name);
      return;
    }
    pokemonImage.alt = data.name;
    return pokemonImage;
  }

  createPokemonType(data: Pokedex.Pokemon) {
    const pokemonType = document.createElement('p');
    pokemonType.innerHTML =
      '#' + data.id + ' ' + data.name + '<br>' + data.types[0].type.name;
    return pokemonType;
  }

  addHoverEffect(pokemonCard: any) {
    pokemonCard.addEventListener('mousemove', (e: any) => {
      const rect = pokemonCard.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const bx = pokemonCard.offsetWidth;
      const by = pokemonCard.offsetHeight;
      const angleX = (cx / bx) * 2 - 1;
      const angleY = ((cy / by) * 2 - 1) * -1;
      pokemonCard.style.setProperty('--angle-x', `${angleX}`);
      pokemonCard.style.setProperty('--angle-y', `${angleY}`);
    });
    pokemonCard.addEventListener('mouseleave', () => {
      const angleX = 0;
      const angleY = 0;
      pokemonCard.style.setProperty('--angle-x', `${angleX}`);
      pokemonCard.style.setProperty('--angle-y', `${angleY}`);
    });
  }

  renderPokemonDetails(data: Pokedex.Pokemon) {
    const pokemonDetailsContainer = document.getElementById(
      'pokemonDetailsContainer'
    );
    if (!pokemonDetailsContainer) {
      console.error('Container not found');
      return;
    }
    const detailsContainer = this.generatePokemonDetailsContainer(data);
    pokemonDetailsContainer.appendChild(detailsContainer);
  }

  pokemonIMG(data: Pokedex.Pokemon) {
    const IMG = document.createElement('img');
    IMG.src =
      'https://img.pokemondb.net/sprites/home/normal/' + data.name + '.png';
    IMG.alt = data.name;
    return IMG;
  }

  generatePokemonDetailsContainer(data: Pokedex.Pokemon): HTMLElement {
    const detailsContainer = document.createElement('div');
    detailsContainer.id = 'ID' + data.id;
    detailsContainer.classList.add('pokemonDetails');
    const shadow = this.addTypeClassesForDetails(data);
    if (typeof shadow === 'string') {
      detailsContainer.classList.add(shadow);
    }
    detailsContainer.appendChild(this.pokemonIMG(data));
    const chart = this.pokemonDetails(data);
    if (!chart) {
      return detailsContainer;
    }
    detailsContainer.appendChild(chart);
    return detailsContainer;
  }

  pokemonDetails(data: Pokedex.Pokemon) {
    const statsList = document.createElement('ul');
    data.stats.forEach((stat) => {
      const statItem = document.createElement('li');
      statItem.textContent = `${stat.stat.name}: ${stat.base_stat}`;
      statsList.appendChild(statItem);
    });
    const canvas = document.createElement('canvas');
    const canvasText = document.createElement('p');
    const ID = 'canvasID' + data.id;
    canvas.id = ID;
    canvasText.textContent = data.name;
    canvas.appendChild(canvasText);
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }
    const statsData: { label: string; value: number }[] = [];
    data.stats.forEach((stat) => {
      statsData.push({ label: stat.stat.name, value: stat.base_stat });
    });
    this.generateChart(canvas, statsData, data);
    return canvas;
  }

  generateChart(
    canvas: any,
    statsData: { label: string; value: number }[],
    data: Pokedex.Pokemon
  ) {
    Chart.defaults.font.size = 10;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: statsData.map((item) => item.label),
        datasets: [
          {
            label: '#' + data.id + ' ' + data.name,
            data: statsData.map((item) => item.value),
            backgroundColor: [
              'rgb(139, 0, 0)',
              'rgb(255, 69, 0)',
              'rgb(0, 100, 0)',
              'rgb(255, 0, 255)',
              'rgb(173, 216, 230)',
              'rgb(255, 255, 102)',
            ],
            borderColor: 'rgb(255, 255, 255)',
            borderWidth: 1,
            clip: { left: 5, top: 5, right: -2, bottom: 0 },
          },
        ],
      },
      options: {
        animation: false,
        indexAxis: 'y',
        layout: {
          padding: 20,
        },
      },
    });
    return chart;
  }

  addTypeClassesForDetails(data: Pokedex.Pokemon) {
    const typeClasses: { [key: string]: string } = {
      normal: 'normalD',
      fairy: 'fairyD',
      fire: 'fireD',
      water: 'waterD',
      electric: 'electricD',
      grass: 'grassD',
      flying: 'flyingD',
      bug: 'bugD',
      poison: 'poisonD',
      rock: 'rockD',
      ground: 'groundD',
      fighting: 'fightingD',
      ice: 'iceD',
      psychic: 'psychicD',
      ghost: 'ghostD',
    };

    const type = data.types[0].type.name;
    return typeClasses[type] || 'dragonD';
  }

  showPokemonDetails(ID: string) {
    const detailsContainer = document.getElementById(ID);
    const pokemonDetailsContainer = document.getElementById(
      'pokemonDetailsContainer'
    );
    if (!detailsContainer || !pokemonDetailsContainer) {
      console.error('Container not found');
      return;
    }
    pokemonDetailsContainer.classList.add('show');
    detailsContainer.classList.add('show');
  }
}
