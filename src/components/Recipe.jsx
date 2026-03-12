import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RecipePage = ({ toggleFavorite, favorites = [] }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const { id } = useParams()
  const [recipeData, setRecipeData] = useState(null);
  
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const isFavourite = favorites.some(fav => fav.idMeal === id);

  useEffect(() => {
    axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then(response => {
        const recipe = response.data.meals[0];
        setRecipeData(recipe);
        setImage(recipe.strMealThumb);
        setTitle(recipe.strMeal);
        setCategory(recipe.strCategory);
        setArea(recipe.strArea);
        setIngredients(getIngredients(recipe));
        setInstructions(recipe.strInstructions ? recipe.strInstructions.split('\n').filter(line => line.trim() !== "") : []);
      })
      .catch(error => {
        console.error("Error fetching recipe:", error);
      });
  }, [id]);

  const handleToggleFav = () => {
      if (recipeData) {
          toggleFavorite(id, title, category, area, image, 1, !isFavourite);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-gray-900 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="w-full h-[500px] relative bg-zinc-200 group overflow-hidden rounded-3xl border-4 border-black">
            <img
              src={image || "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1200&q=80"}
              alt={title || "Recipe"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex justify-between items-end">
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] mb-2">{category} • {area}</p>
                <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-widest leading-none italic">
                    {title || "Loading..."}
                </h1>
              </div>
              
              <button 
                onClick={handleToggleFav}
                className={`p-4 rounded-2xl border-4 transition-all duration-300 active:scale-95 ${isFavourite ? 'bg-white border-white' : 'bg-black/20 border-white/50 hover:bg-white hover:border-white'}`}
              >
                <svg className={`w-8 h-8 ${isFavourite ? 'text-black fill-current' : 'text-white'}`} fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="pt-8">
              <h2 className="text-3xl font-black uppercase tracking-widest mb-6 pb-2 border-b-8 border-black inline-block">
                Instructions
              </h2>
              
              <div className="space-y-8 mt-2">
                {instructions.map((step, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <span className="text-4xl font-black text-zinc-200 leading-none">{(index + 1).toString().padStart(2, '0')}</span>
                    <p className="text-lg pt-1 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT CONTAINER ================= */}
        <div className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-24 h-fit">
          <div className="w-full h-80 bg-zinc-100 flex items-center justify-center overflow-hidden border-4 border-black rounded-3xl transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Ingredient preview"
                className="w-full h-full object-contain p-4 transition-opacity duration-300"
              />
            ) : (
              <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs text-center px-12 leading-relaxed">
                Hover on an ingredient to see a preview
              </p>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-black uppercase tracking-widest mb-8 pb-2 border-b-8 border-black inline-block">
              Ingredients
            </h2>
            <ul className="flex flex-col gap-3">
              {ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="p-4 bg-zinc-50 border-2 border-zinc-100 rounded-xl hover:border-black transition-all duration-200 cursor-pointer flex justify-between items-center group"
                  onMouseEnter={() => setPreviewImage(ingredient.img)}
                  onMouseLeave={() => setPreviewImage(null)}
                >
                  <span className="font-bold text-gray-900 uppercase tracking-tight">{ingredient.name}</span>
                  <span className="text-zinc-400 font-black text-xs uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-zinc-200 group-hover:border-black group-hover:text-black transition-colors">{ingredient.measure}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-black text-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
              <h4 className="font-black uppercase tracking-widest text-xs mb-4 text-zinc-400">Chef's Tip</h4>
              <p className="text-sm font-medium leading-relaxed italic">
                  "Most of these ingredients can be substituted based on your preference or dietary needs. Don't be afraid to experiment!"
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;

const getIngredients = (recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const name = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (name && name.trim() !== "") {
            ingredients.push({
                name: name,
                measure: measure,
                img: `https://www.themealdb.com/images/ingredients/${name}.png`
            });
        }
    }
    return ingredients;
}