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
    <div id="pokemonContainer"></div>
    <div id="pokemonDetailsContainer"></div>
    <div id="mobileScreen">
      <div>
        <img id="rotateDeviceImage" src="../assets/img/rotate_device.gif" />
      </div>
      <div>Um den Pokedex nutzen zu können, bitte das Gerät drehen.</div>
    </div>
    <app-footer></app-footer>
  </section>`,
})
export class LandingPageComponent implements OnInit {
  constructor() {}

  async ngOnInit(): Promise<void> {
    this.checkForBrowserSystem();
    await this.getData();
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event: any) {
    this.checkForBrowserSystem();
  }

  checkForBrowserSystem() {
    let isLandscape = window.matchMedia('(orientation: landscape)').matches;
    const mobileScreenElement = document.getElementById('mobileScreen');

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      if (mobileScreenElement) {
        if (isLandscape) {
          console.log(isLandscape);
          console.log(mobileScreenElement.style.display);
          mobileScreenElement.style.display = 'none';
          console.log(mobileScreenElement.style.display);
        } else {
          console.log(isLandscape);
          console.log(mobileScreenElement.style.display);
          mobileScreenElement.style.display = 'flex';
          console.log(mobileScreenElement.style.display);
        }
      }
    } else {
      if (mobileScreenElement) {
        mobileScreenElement.style.display = 'none';
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

  renderPokemonData(data: Pokedex.Pokemon) {
    const pokemonContainer = document.getElementById('pokemonContainer');
    const pokemonCard = this.createPokemonCard(data);
    const pokemonImage = this.createPokemonImage(data);
    if (!pokemonCard || !pokemonImage || !pokemonContainer) {
      console.error('Failed to create Pokemon card, image or div');
      return;
    }
    pokemonCard.appendChild(pokemonImage);
    pokemonContainer.appendChild(pokemonCard);
  }

  createPokemonCard(data: Pokedex.Pokemon) {
    const pokemonCard = document.createElement('div');
    const ID = 'ID' + data.id;
    pokemonCard.classList.add(data.types[0].type.name);
    pokemonCard.id = 'Nr' + data.id;
    pokemonCard.addEventListener('click', () => {
      this.showPokemonDetails(ID);
    });
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
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: statsData.map((item) => item.label),
        datasets: [
          {
            label: '#' + data.name,
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

  addTypeClassesForDetails(data: Pokedex.Pokemon) {
    const typeClasses: { [key: string]: string } = {
      normal: 'normalD',
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
}
