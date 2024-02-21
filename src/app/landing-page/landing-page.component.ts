import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import Pokedex from 'pokedex-promise-v2';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  styleUrls: ['./landing-page.component.scss'],

  template: ` <section>
    <app-nav-bar (closeButtonClicked)="closePokemonDetails()"></app-nav-bar>
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
  </section>`,
})
export class LandingPageComponent implements OnInit {
  currentPokemonDetailsId: string | null = null;

  constructor() {
    this.setFilter = this.setFilter.bind(this);
  }

  async ngOnInit(): Promise<void> {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    this.checkForBrowserSystem(isLandscape);
    this.renderPokemonTypeFilter();
    await this.getData();
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      document.querySelectorAll('.pokemonCard').forEach((card) => {
        card.classList.add('mobilePokemonCard');
        card.classList.remove('pokemonCard');
      });
    }
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
      const allCheckbox =
        document.querySelector<HTMLInputElement>('input[value="all"]');
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
    const elementsContainer = this.createElementsContainer(data);
    detailsContainer.appendChild(elementsContainer);
    const shadow = this.addTypeClassesForDetails(data);
    if (typeof shadow === 'string') {
      detailsContainer.classList.add(shadow);
    }
    const chart = this.pokemonDetails(data);
    if (chart) {
      detailsContainer.appendChild(chart);
    }
    return detailsContainer;
  }
  
  createElementsContainer(data: Pokedex.Pokemon): HTMLElement {
    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('elementContainer');
    elementsContainer.appendChild(this.createPrevButton(data));
    elementsContainer.appendChild(this.pokemonIMG(data));
    elementsContainer.appendChild(this.createNextButton(data));
    return elementsContainer;
  }
  
  createPrevButton(data: Pokedex.Pokemon): HTMLButtonElement {
    const prevButton = document.createElement('button');
    prevButton.id = 'prev' + data.id;
    prevButton.classList.add('prevButton');
    prevButton.addEventListener('click', () => {
      this.navigatePokemon(-1, data.id);
    });
    return prevButton;
  }
  
  createNextButton(data: Pokedex.Pokemon): HTMLButtonElement {
    const nextButton = document.createElement('button');
    nextButton.id = 'next' + data.id;
    nextButton.classList.add('nextButton');
    nextButton.addEventListener('click', () => {
      this.navigatePokemon(1, data.id);
    });
    return nextButton;
  }

  pokemonDetails(data: Pokedex.Pokemon) {
    const statsChartContainer = document.createElement('div');
    const canvasText = document.createElement('p');
    statsChartContainer.classList.add('chart');
    canvasText.textContent = data.name;
    statsChartContainer.appendChild(canvasText);
    if (!statsChartContainer) {
      console.error('statsChart not found');
      return;
    }
    const statsData: { label: string; value: number }[] = [];
    data.stats.forEach((stat) => {
      statsData.push({ label: stat.stat.name, value: stat.base_stat });
    });
    this.generateChart(statsChartContainer, statsData);
    return statsChartContainer;
  }

  generateChart(
    statsChartContainer: HTMLElement,
    statsData: { label: string; value: number }[]
  ) {
    statsData.forEach((stat) => {
      const statsContainer = document.createElement('div');
      statsContainer.classList.add('statsContainer');
      const parentStatsDiv = document.createElement('div');
      const statsInfo = this.generateStatsInfo(stat);
      const bar = this.generateBar(stat);
      parentStatsDiv.classList.add('parentStatsDiv');
      parentStatsDiv.appendChild(statsInfo);
      parentStatsDiv.appendChild(bar);
      statsContainer.appendChild(parentStatsDiv);
      statsChartContainer.appendChild(statsContainer);
    });

    return statsChartContainer;
  }

  generateStatsInfo(stat: { label: string; value: number }) {
    const parentSpan = document.createElement('span');
    const labelSpan = document.createElement('span');
    const valueSpan = document.createElement('span');
    labelSpan.textContent = stat.label;
    valueSpan.textContent = stat.value.toString();
    parentSpan.appendChild(labelSpan);
    parentSpan.appendChild(valueSpan);
    parentSpan.classList.add('statsInfo');
    return parentSpan;
  }

  generateBar(stat: { label: string; value: number }) {
    const parentBarDiv = document.createElement('div');
    const childBarDiv = document.createElement('div');
    const widthInProzent = (100 / 200) * stat.value;
    parentBarDiv.classList.add('parentBarDiv');
    childBarDiv.classList.add('childBarDiv');
    childBarDiv.style.width = widthInProzent.toString() + '%';
    parentBarDiv.appendChild(childBarDiv);
    return parentBarDiv;
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
    const showCloseButton = document.getElementById('closeButton');
    const pokemonDetailsContainer = document.getElementById(
      'pokemonDetailsContainer'
    );
    if (!detailsContainer || !pokemonDetailsContainer) {
      console.error('Container or buttons not found');
      return;
    }
    pokemonDetailsContainer.classList.add('show');
    detailsContainer.classList.add('show');
    this.currentPokemonDetailsId = ID;
    showCloseButton?.classList.add('show');
  }

  navigatePokemon(offset: number, currentPokemonId: number) {
    const currentContainer = document.getElementById('ID' + currentPokemonId);
    if (!currentContainer) return;
    const nextPokemonId = currentPokemonId + offset;
    const nextContainer = document.getElementById(
      'ID' + nextPokemonId
    ) as HTMLElement;
    if (!nextContainer) return;
    currentContainer.classList.remove('show');
    nextContainer.classList.add('show');
    this.currentPokemonDetailsId = 'ID' + nextPokemonId;
  }

  closePokemonDetails() {
    if (!this.currentPokemonDetailsId) return;
    console.log(this.currentPokemonDetailsId);
    const detailsContainer = document.getElementById(this.currentPokemonDetailsId);
    const showCloseButton = document.getElementById('closeButton');
    const pokemonDetailsContainer = document.getElementById(
      'pokemonDetailsContainer'
    );
    if (!detailsContainer || !pokemonDetailsContainer) {
      console.error('Container or buttons not found');
      return;
    }
    pokemonDetailsContainer.classList.remove('show');
    showCloseButton?.classList.remove('show');
    detailsContainer.classList.remove('show');
    this.currentPokemonDetailsId = null;
  }
}
