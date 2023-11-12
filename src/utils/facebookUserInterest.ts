export const getFacebookInterestsForLens = (userProfile: any) => { 
    var interests:string[] = [];
    const favoriteAthletes = userProfile.favorite_athletes;
    const music = userProfile.music;
    const quotes = userProfile.quotes;
    const favoriteTeams = userProfile.favoriteTeams;
    if (favoriteAthletes) {
        if (favoriteAthletes.length>0) {
            interests.push("HOBBIES_INTERESTS__SPORTS");
        }
    }
    if (music) {
        if (music.data.length>0) {
            interests.push("ART_ENTERTAINMENT__MUSIC");
        }
    }
    if (favoriteTeams) {
        if (favoriteTeams.length>0) {
            interests.push("HOBBIES_INTERESTS__SPORTS");   
        }
    }
    if (quotes) {
        if (quotes.data.length>0) {
            interests.push("ART_ENTERTAINMENT__BOOKS");   
        }
    }
    interests.push("LENS");   
    interests.push("CRYPTO__WEB3_SOCIAL");   

    return interests;
}

export const getFacebookInformationForLens = (userProfile: any) => { 
    const ageRangeMin = userProfile.age_range?.min;
    const gender = userProfile.gender;
    const hometown = userProfile.hometown?.name;
    const likes = userProfile.likes;
    var pages: string[] = [];
    if (likes) {
        for (let i=0; i<likes.data.length; i++) {
            pages[i] = likes.data[i].name;
        }
    }
    const message = "Some info about who I am: \n" +  
                    "My minmum age range is: "+ ageRangeMin + "\n" +
                    "My gender is: " + gender + "\n" +
                    "My hometown is: " + hometown + "\n" + 
                    "I like these pages from facebook: " + pages + "\n";

    return message;

}
