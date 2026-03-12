import React, { useEffect, useState } from 'react';
import RecipeCard from './RecipeCard';
import axios from 'axios';

const Browse = ({ toggleFavorite, favorites = [] }) => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [region, setRegion] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState([]);

    useEffect(() => {
        const fetchFilters = async () => {
            setLoading(true);
            try {
                const [ingRes, regRes, catRes] = await Promise.all([
                    axios.get("https://www.themealdb.com/api/json/v1/1/list.php?i=list"),
                    axios.get("https://www.themealdb.com/api/json/v1/1/list.php?a=list"),
                    axios.get("https://www.themealdb.com/api/json/v1/1/categories.php")
                ]);

                if (ingRes.data && ingRes.data.meals) {
                    const ingredientNames = ingRes.data.meals
                        .map(item => item.strIngredient)
                        .filter(name => name && name.trim() !== "")
                        .sort();
                    setIngredients(ingredientNames);
                }

                if (regRes.data && regRes.data.meals) {
                    const regionNames = regRes.data.meals.map(r => r.strArea).sort();
                    setRegion(regionNames);
                }

                if (catRes.data && catRes.data.categories) {
                    const categoryNames = catRes.data.categories.map(cat => cat.strCategory).sort();
                    setCategories(categoryNames);
                }
            } catch (error) {
                console.error("Error fetching filters:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilters();
    }, []);




    const [categoryCache, setCategoryCache] = useState({});
    const [regionCache, setRegionCache] = useState({});
    const [ingredientCache, setIngredientCache] = useState({}); 

    const handleFilterChange = async (filterType, item, isChecked) => {
    
        if (filterType === 'category') {
            setSelectedCategories(prev => isChecked ? [...prev, item] : prev.filter(i => i !== item));
        } else if (filterType === 'region') {
            setSelectedRegion(prev => isChecked ? [...prev, item] : prev.filter(i => i !== item));
        } else if (filterType === 'ingredient') {
            setSelectedIngredients(prev => isChecked ? [...prev, item] : prev.filter(i => i !== item));
        }

        if (isChecked) {
            if (filterType === 'category' && !categoryCache[item]) {
                const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${item}`);
                setCategoryCache(prev => ({ ...prev, [item]: res.data.meals || [] }));
            }
            if (filterType === 'region' && !regionCache[item]) {
                const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${item}`);
                setRegionCache(prev => ({ ...prev, [item]: res.data.meals || [] }));
            }
            if (filterType === 'ingredient' && !ingredientCache[item]) {
            const formattedIngredient = item.toLowerCase().replace(/ /g, '_');
            const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedIngredient}`);
            setIngredientCache(prev => ({ ...prev, [item]: res.data.meals || [] }));
        }
        }
    };

    const getDisplayMeals = () => {
        let categoryMeals = [];
    selectedCategories.forEach(cat => {
        if (categoryCache[cat]) categoryMeals = union(categoryMeals, categoryCache[cat]);
    });

    let regionMeals = [];
    selectedRegion.forEach(reg => {
        if (regionCache[reg]) regionMeals = union(regionMeals, regionCache[reg]);
    });

    let ingredientMeals = [];
    if (selectedIngredients.length > 0) {
        const cachedIngredientArrays = selectedIngredients
            .map(ing => ingredientCache[ing])
            .filter(Boolean); 
        if (cachedIngredientArrays.length > 0) {
            ingredientMeals = cachedIngredientArrays.reduce((accumulated, current) => {
                return intersection(accumulated, current);
            });
        }
    }

    const activeFilterLists = [];
    if (selectedCategories.length > 0) activeFilterLists.push(categoryMeals);
    if (selectedRegion.length > 0) activeFilterLists.push(regionMeals);
    if (selectedIngredients.length > 0) activeFilterLists.push(ingredientMeals);

    if (activeFilterLists.length === 0) return [];

    return activeFilterLists.reduce((accumulatedMeals, currentList) => {
        if (accumulatedMeals.length === 0) return [];
        return intersection(accumulatedMeals, currentList);
    });
    };

    const displayData = getDisplayMeals();


    return (
        <div className="h-[calc(100vh-72px)] w-full flex overflow-hidden bg-white text-gray-900 font-sans">

            <aside className="w-1/5 h-full border-r overflow-y-auto border-zinc-200 bg-white flex flex-col">

                <div className="p-6 border-b border-zinc-100">
                    <IngredientSearch
                        ingredientsList={ingredients}
                        activeFilters={selectedIngredients}
                        onChange={(item, isChecked) => handleFilterChange('ingredient', item, isChecked)}
                    />
                </div>

                <div className="p-6 border-b border-zinc-100">
                    <CategorySearch
                        categories={categories}
                        activeFilters={selectedCategories}
                        onChange={(item, isChecked) => handleFilterChange('category', item, isChecked)}
                        loading={loading}
                    />
                </div>

                <div className="p-6">
                    <RegionSearch
                        region={region}
                        activeFilters={selectedRegion}
                        onChange={(item, isChecked) => handleFilterChange('region', item, isChecked)}
                        loading={loading}
                    />
                </div>
            </aside>

            {/* ================= MAIN CONTENT (80%) ================= */}
            <main className="w-4/5 h-full overflow-y-auto bg-zinc-50 p-8 md:p-12">

                <div className="mb-12">
                    <h1 className="text-4xl font-black uppercase tracking-widest">Results</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Showing {displayData.length} recipes</p>
                </div>

                {/* The Flex Container mapping your RecipeCards */}
                <div className="flex flex-wrap gap-8">
                    {displayData.map((recipe) => (
                        <RecipeCard 
                            key={recipe.idMeal} 
                            recipe={recipe} 
                            toggleFavorite={toggleFavorite} 
                            favorites={favorites} 
                        />
                    ))}
                </div>

            </main>

        </div>
    );
};

export default Browse;


const IngredientSearch = ({ ingredientsList, activeFilters, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const dropdownOptions = ingredientsList.filter(ingredient =>
        ingredient.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activeFilters.includes(ingredient)
    );

    // Call onChange with true to add
    const addFilter = (ingredient) => {
        onChange(ingredient, true);
        setSearchTerm('');
    };
    
    // Call onChange with false to remove
    const removeFilter = (ingredientToRemove) => {
        onChange(ingredientToRemove, false);
    };

    return (
        <div className="w-full max-w-md">
            <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Search</h2>

            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ingredients..."
                    className="w-full bg-zinc-100 text-gray-900 border-2 border-black rounded-none py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-colors font-medium placeholder-zinc-400"
                />

                {searchTerm.length > 0 && dropdownOptions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-xl max-h-60 overflow-y-auto">
                        {dropdownOptions.map((ingredient) => (
                            <li
                                key={ingredient}
                                onClick={() => addFilter(ingredient)}
                                className="px-4 py-3 hover:bg-black hover:text-white cursor-pointer transition-colors font-semibold border-b border-zinc-100 last:border-none"
                            >
                                {ingredient}
                            </li>
                        ))}
                    </ul>
                )}

                {searchTerm.length > 0 && dropdownOptions.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-xl px-4 py-3 text-zinc-500 font-semibold italic">
                        No ingredients found.
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                    <div
                        key={filter}
                        className="flex items-center gap-2 bg-black text-white px-3 py-1.5 text-sm font-bold uppercase tracking-wide border-2 border-black hover:bg-white hover:text-black transition-colors cursor-pointer group"
                        onClick={() => removeFilter(filter)}
                        title="Click to remove"
                    >
                        <span>{filter}</span>
                        <svg
                            className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                ))}
            </div>

        </div>
    );
};

const CategorySearch = ({ categories, activeFilters, onChange, loading }) => {

    return (
        <div>
            <h3 className="font-bold uppercase tracking-wide text-sm text-zinc-500 mb-4 px-1">Categories</h3>
            <div className="flex flex-wrap gap-1">
                {loading ? (
                    <p className="text-zinc-400 italic px-1">Loading categories...</p>
                ) : (
                    categories.map((category) => (
                        <label
                            key={category}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer group transition-colors rounded-lg ${activeFilters.includes(category) ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                        >
                            <input
                                type="checkbox"
                                checked={activeFilters.includes(category)}
                                onChange={(e) => onChange(category, e.target.checked)}
                                className="w-5 h-5 border-zinc-300 rounded-sm text-black focus:ring-black cursor-pointer"
                            />
                            <span className={`text-lg font-medium transition-colors ${activeFilters.includes(category) ? 'text-black' : 'text-zinc-600 group-hover:text-black'}`}>
                                {category}
                            </span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
}

const RegionSearch = ({ region, activeFilters, onChange, loading }) => {

    return (
        <div>
            <h3 className="font-bold uppercase tracking-wide text-sm text-zinc-500 mb-4 px-1">Region</h3>
            <div className="flex flex-wrap gap-1">
                {loading ? (
                    <p className="text-zinc-400 italic px-1">Loading regions...</p>
                ) : (
                    region.map((region) => (
                        <label
                            key={region}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer group transition-colors rounded-lg ${activeFilters.includes(region) ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                        >
                            <input
                                type="checkbox"
                                checked={activeFilters.includes(region)}
                                onChange={(e) => onChange(region, e.target.checked)}
                                className="w-5 h-5 border-zinc-300 rounded-sm text-black focus:ring-black cursor-pointer"
                            />
                            <span className={`text-lg font-medium transition-colors ${activeFilters.includes(region) ? 'text-black' : 'text-zinc-600 group-hover:text-black'}`}>
                                {region}
                            </span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
}

function union(arr1, arr2) {
    const combined = [...arr1, ...arr2];
    return combined.filter((meal, index, self) =>
        index === self.findIndex((m) => m.idMeal === meal.idMeal)
    );
}

// Only keeps meals that exist in BOTH arrays based on ID
function intersection(arr1, arr2) {
    return arr1.filter(meal1 =>
        arr2.some(meal2 => meal2.idMeal === meal1.idMeal)
    );
}