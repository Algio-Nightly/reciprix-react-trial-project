import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import Browse from './components/Browse'
import FavouritesPage from './components/Favourites'
import axios from 'axios';
import { useEffect } from 'react';
import RecipePage from './components/Recipe';
function App() {
  const randomItemsNumber = 25;
  const [randomRecipesBanner, setRandomRecipesBanner] = useState([]);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('recipeVault');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recipeVault', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id, strMeal, strCategory, strArea, strMealThumb, serving, isChecked) => {
    const recipeObj = { idMeal: id, strMeal:strMeal, strCategory:strCategory, strArea:strArea, strMealThumb:strMealThumb, serving:serving,isChecked:isChecked};
    setFavorites((prev) => {
      const isAlreadySaved = prev.some(fav => fav.idMeal === id);
      if (isAlreadySaved) {
        return prev.filter(fav => fav.idMeal !== id);
      } else {
        return [...prev, recipeObj];
      }
    });
  };

  const setRecipeChecked = (id, isChecked) => {
    setFavorites((prev) => 
      prev.map(recipe => 
        recipe.idMeal === id ? { ...recipe, isChecked } : recipe
      )
    );
  };


  const getRandomRecipes = async (number, func) => {
    try {
      const requests = Array.from({ length: number }).map(() =>
        axios.get(`https://www.themealdb.com/api/json/v1/1/random.php`)
      );

      const responses = await Promise.all(requests);
      const meals = responses.map(res => res.data.meals[0]);
      func(meals);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getRandomRecipes(5, setRandomRecipesBanner),
        getRandomRecipes(randomItemsNumber, setRandomRecipes)
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage randomRecipesBanner={randomRecipesBanner} randomRecipes={randomRecipes} loading={loading} toggleFavorite={toggleFavorite} favorites={favorites} />} />
            <Route path="/browse-recipes" element={<Browse toggleFavorite={toggleFavorite} favorites={favorites} />} />
            <Route path="/favourites" element={<FavouritesPage favorites={favorites} toggleFavorite={toggleFavorite} setRecipeChecked={setRecipeChecked} />} />
            <Route path="/recipe/:id" element={<RecipePage toggleFavorite={toggleFavorite} favorites={favorites} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App;
