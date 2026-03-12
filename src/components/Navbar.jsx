import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Hardcoding the 14 categories saves us 1 API call!
const CATEGORIES = [
    "Beef", "Breakfast", "Chicken", "Dessert", "Goat", "Lamb", 
    "Miscellaneous", "Pasta", "Pork", "Seafood", "Side", "Starter", "Vegan", "Vegetarian"
];

function Navbar() {
    return (
        <nav className="flex items-center justify-between px-12 py-3 bg-black sticky top-0 z-50 transition-all duration-300">
            <div className="flex items-center group cursor-pointer">
                <span className="text-3xl font-black text-white tracking-[0.2em] uppercase">Reciprix - Daily Digest</span>
            </div>

            <ul className="hidden md:flex items-center gap-14">
                <li className="relative group overflow-hidden">
                    <Link to="/" className="text-white text-lg font-bold hover:text-white transition-colors py-2 block tracking-widest uppercase">
                        Home
                    </Link>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                </li>
                <li className="relative group overflow-hidden">
                    <Link to="/browse-recipes" className="text-white/80 text-lg font-bold hover:text-white transition-colors py-2 block tracking-widest uppercase">
                        Browse Recipes
                    </Link>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                </li>
                <li className="relative group overflow-hidden">
                    <Link to="/favourites" className="text-white/80 text-lg font-bold hover:text-white transition-colors py-2 block tracking-widest uppercase">
                        Favourites
                    </Link>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                </li>
            </ul>

            <div className="flex items-center gap-8">
                <NavbarSearch />
                <button className="bg-white text-black hover:bg-gray-200 px-8 py-2 rounded-xl text-base font-black transition-all duration-300 active:scale-95 shadow-xl">
                    Search
                </button>
            </div>
        </nav>
    );
}

export default Navbar;

const NavbarSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [globalRecipes, setGlobalRecipes] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    const navigate = useNavigate();
    useEffect(() => {
        const fetchAllRecipesMinimal = async () => {
            try {
                const fetchPromises = CATEGORIES.map(category => 
                    axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
                );

                const responses = await Promise.all(fetchPromises);
                const massiveRecipeList = responses.flatMap(res => res.data.meals || []);

                setGlobalRecipes(massiveRecipeList);
            } catch (error) {
                console.error("Failed to hydrate global recipes:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAllRecipesMinimal();
    }, []);

    const searchResults = searchTerm.length > 0 
        ? globalRecipes.filter(recipe => 
            recipe.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 8)
        : [];

    const handleSelectRecipe = (idMeal) => {
        navigate(`/recipe/${idMeal}`);
        setSearchTerm(''); 
    };

    return (
        <div className="relative w-full max-w-sm lg:max-w-md z-50">
            <div className="relative flex items-center group">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoadingData}
                    placeholder={isLoadingData ? "Loading..." : "Search recipes..."}
                    className="w-full pl-12 pr-6 py-2 bg-white/10 border-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/40 rounded-xl text-base font-medium transition-all duration-300 outline-none text-white placeholder-white/40 disabled:opacity-50"
                />
                <svg className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {searchTerm.length > 0 && (
                <div className="absolute z-[100] w-full mt-2 bg-white border-2 border-black shadow-2xl overflow-hidden rounded-xl">
                    {searchResults.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto">
                            {searchResults.map((recipe) => (
                                <li
                                    key={recipe.idMeal}
                                    onClick={() => handleSelectRecipe(recipe.idMeal)}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-black hover:text-white cursor-pointer transition-colors border-b border-zinc-100 last:border-none group text-black"
                                >
                                    <img 
                                        src={recipe.strMealThumb} 
                                        alt={recipe.strMeal} 
                                        className="w-10 h-10 object-cover border border-zinc-200 group-hover:border-zinc-700 rounded-sm"
                                    />
                                    <h4 className="font-bold text-sm leading-tight truncate">
                                        {recipe.strMeal}
                                    </h4>
                                </li>
                            ))}
                        </ul>
                    ) : !isLoadingData && (
                        <div className="px-4 py-4 text-center text-black">
                            <p className="text-zinc-500 font-semibold italic text-sm text-black">No recipes found for "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

