import React, { useState, useEffect } from 'react';
import 'dota2-minimap-hero-sprites/assets/stylesheets/dota2minimapheroes.css';
import './App.css';

const CACHE_KEY = 'heroesData'; // Define cache key

const App = () => {
  const [heroes, setHeroes] = useState([]);
  const [heroData, setHeroData] = useState({});
  const [sortBy, setSortBy] = useState('games'); // Default sorting by games
  const [sortDirection, setSortDirection] = useState('desc'); // Default sorting direction is descending

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY); // Retrieve cached data from localStorage
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Check if cached data is less than 1 hour old
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          setHeroes(data); // Set cached data to state
          return;
        }
      }

      try {
        const response = await fetch('https://api.opendota.com/api/players/205511222/heroes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHeroes(data); // Set fetched data to state
        // Cache the data with timestamp
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (error) {
        console.error('Error fetching heroes:', error);
      }
    };
    const fetchHeroes = async () => {
      try {
        const response = await fetch('https://api.opendota.com/api/players/205511222/heroes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHeroes(data);
      } catch (error) {
        console.error('Error fetching heroes:', error);
      }
    };

    const fetchHeroData = async () => {
      try {
        const response = await fetch('https://api.opendota.com/api/heroes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const heroMap = {};
        data.forEach(hero => {
          heroMap[hero.id] = {
            name: hero.localized_name,
            icon: `hero-${hero.id}` // Using the class directly to render the icon
          };
        });
        setHeroData(heroMap);
      } catch (error) {
        console.error('Error fetching hero data:', error);
      }
    };

    fetchData();
    fetchHeroes();
    fetchHeroData();
  }, []);
  
  const refreshData = async () => {
    localStorage.removeItem(CACHE_KEY); // Remove cached data from localStorage
    try {
      const response = await fetch('https://api.opendota.com/api/players/205511222/heroes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHeroes(data); // Set fetched data to state
      // Cache the data with timestamp
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error('Error fetching heroes:', error);
    }
  };

  // Sorting function by games played
  const sortByGames = () => {
    const sortedHeroes = [...heroes].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.games - b.games;
      } else {
        return b.games - a.games;
      }
    });
    setHeroes(sortedHeroes);
    setSortBy('games');
  };

  // Sorting function by wins
  const sortByWins = () => {
    const sortedHeroes = [...heroes].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.win - b.win;
      } else {
        return b.win - a.win;
      }
    });
    setHeroes(sortedHeroes);
    setSortBy('wins');
  };

  // Sorting function by win rate
  const sortByWinRate = () => {
    const sortedHeroes = [...heroes].sort((a, b) => {
      const winRateA = a.games === 0 ? 0 : a.win / a.games;
      const winRateB = b.games === 0 ? 0 : b.win / b.games;
      if (sortDirection === 'asc') {
        return winRateA - winRateB;
      } else {
        return winRateB - winRateA;
      }
    });
    setHeroes(sortedHeroes);
    setSortBy('winRate');
  };

  // Toggle sorting direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <h1>Heroes</h1>
      <div className="sorting-buttons">
        <button onClick={sortByGames}>Sort by Games Played</button>
        <button onClick={sortByWins}>Sort by Wins</button>
        <button onClick={sortByWinRate}>Sort by Win Rate</button>
        <button onClick={toggleSortDirection}>Toggle Sort Direction</button>
        
        <p>Currently sorted by: {sortBy}</p>
        <button onClick={refreshData}>Refresh Data</button> {/* Button to refresh data */}
      </div>
      <ul className="hero-list">
        {heroes.map(hero => (
          <li key={hero.hero_id} className="hero">
            <i className={'d2mh ' + heroData[hero.hero_id]?.icon} alt={heroData[hero.hero_id]?.name} />
            <div className="hero-info">
              <h2>{heroData[hero.hero_id]?.name || 'Unknown'}</h2>
              <p className="hero-stats">
                Last Played: {hero.last_played}, Games: {hero.games}, Win: {hero.win},
                With Games: {hero.with_games}, With Win: {hero.with_win}, Against Games: {hero.against_games},
                Against Win: {hero.against_win},
                Win Rate: {hero.games === 0 ? '0.00%' : `${(hero.win / hero.games * 100).toFixed(2)}%`}
              </p>
              <div className="win-rate-bar">
                {hero.games !== 0 && (
                  <div
                    className="win-rate-fill"
                    style={{
                      width: `${(hero.win / hero.games * 100).toFixed(2)}%`,
                      backgroundColor: hero.win / hero.games === 0 ? '#777' : '#4caf50' // Grey for 0 win rate
                    }}
                  ></div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
