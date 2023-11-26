export const lensInterests = [
  {value:"ART_ENTERTAINMENT", label: "Art & Entertainment"},
  {value:"ART_ENTERTAINMENT__BOOKS", label: "Books"},
  {value:"ART_ENTERTAINMENT__ART", label: "Art"},
  {value:"ART_ENTERTAINMENT__DESIGN", label: "Design"},
  {value:"ART_ENTERTAINMENT__PHOTOGRAPHY", label: "Photography"},
  {value:"ART_ENTERTAINMENT__FASHION", label: "Fashion"},
  {value:"ART_ENTERTAINMENT__ANIME", label: "Anime"},
  {value:"ART_ENTERTAINMENT__MEMES", label: "Memes"},
  {value:"ART_ENTERTAINMENT__FILM_TV", label: "Films"},
  {value:"ART_ENTERTAINMENT__MUSIC", label: "Music"},
  {value:"BUSINESS", label: "Business"},
  {value:"BUSINESS__CREATOR_ECONOMY", label: "Creator economy"},
  {value:"BUSINESS__FINANCE", label: "Finance"},
  {value:"BUSINESS__MARKETING", label: "Marketing"},
  {value:"TECHNOLOGY", label: "Technology"},
  {value:"TECHNOLOGY__AI_ML", label: "Artifical Intelligence & Machine Learning"},
  {value:"TECHNOLOGY__SCIENCE", label: "Science"},
  {value:"TECHNOLOGY__PROGRAMMING", label: "Programming"},
  {value:"TECHNOLOGY__TOOLS", label: "Tech Tools"},
  {value:"TECHNOLOGY__BIOTECH", label: "Biotech"},
  {value:"CAREER", label: "Career Advice"},
  {value:"EDUCATION", label: "Education"},
  {value:"FAMILY_PARENTING", label: "Parenting"},
  {value:"HEALTH_FITNESS", label: "Health"},
  {value:"HEALTH_FITNESS__EXERCISE", label: "Fitness & Excercise"},
  {value:"HEALTH_FITNESS__BIOHACKING", label: "Biohacking"},
  {value:"FOOD_DRINK", label: "Food"},
  {value:"FOOD_DRINK__RESTAURANTS", label: "Restaurants"},
  {value:"FOOD_DRINK__COOKING", label: "Cooking"},
  {value:"FOOD_DRINK__COCKTAILS", label: "Cocktails"},
  {value:"FOOD_DRINK__BEER", label: "Beer"},
  {value:"FOOD_DRINK__WINE", label: "Wine"},
  {value:"HOBBIES_INTERESTS", label: "Hobbies"},
  {value:"HOBBIES_INTERESTS__ARTS_CRAFTS", label: "Arts & Crafts"},
  {value:"HOBBIES_INTERESTS__GAMING", label: "Gaming"},
  {value:"HOBBIES_INTERESTS__TRAVEL", label: "Travel"},
  {value:"HOBBIES_INTERESTS__COLLECTING", label: "Collectibles"},
  {value:"HOBBIES_INTERESTS__SPORTS", label: "Sports"},
  {value:"HOBBIES_INTERESTS__CARS", label: "Cars"},
  {value:"HOME_GARDEN", label: "Home & Garden"},
  {value:"HOME_GARDEN__NATURE", label: "Nature"},
  {value:"HOME_GARDEN__ANIMALS", label: "Animals"},
  {value:"HOME_GARDEN__HOME_IMPROVEMENT", label: "Home Improvement"},
  {value:"HOME_GARDEN__GARDENING", label: "Gardening"},
  {value:"LAW_GOVERNMENT_POLITICS", label: "Politics"},
  {value:"LAW_GOVERNMENT_POLITICS__REGULATION", label: "Politics"},
  {value:"NEWS", label: "News"},
  {value:"LENS", label: "Lens"},
  {value:"CRYPTO", label: "Crypto"},
  {value:"CRYPTO__NFT", label: "NFTs"},
  {value:"CRYPTO__DEFI", label: "DEFI"},
  {value:"CRYPTO__WEB3", label: "Web3"},
  {value:"CRYPTO__WEB3_SOCIAL", label: "Web3 Social"},
  {value:"CRYPTO__GOVERNANCE", label: "Governance"},
  {value:"CRYPTO__DAOS", label: "DAOs"},
  {value:"CRYPTO__GM", label: "GM"},
  {value:"CRYPTO__METAVERSE", label: "Metaverse"},
  {value:"CRYPTO__REKT", label: "Crypto-REKT"},
  {value:"CRYPTO__ETHEREUM", label: "Ethereum"},
  {value:"CRYPTO__BITCOIN", label: "Bitcoin"},
  {value:"CRYPTO__L1", label: "Crypto Layer 1s"},
  {value:"CRYPTO__L2", label: "Crypto Layer 2s"},
  {value:"CRYPTO__SCALING", label: "Crypto Scaling"},
  {value:"NSFW", label: "NSFW"},
];
export const translateInterests = (interestslist:string[]) => {
  let translatedList: {value: string, label:string}[] = [];
  for (let i=0; i<interestslist.length;i++) {
    for (let j=0;j<lensInterests.length;j++) {
      if (interestslist[i] == lensInterests[j].value) {
        //console.log(`${interestslist[i]} == ${lensInterests[j].value}`)
        translatedList.push(lensInterests[j]);
      }
    }
  }
  return translatedList;
}
  