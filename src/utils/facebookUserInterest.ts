export const getFacebookInterests = (userProfile: any) => { 
    var interests:string[] = [];
    const favoriteAthletes = userProfile.favorite_athletes;
    const music = userProfile.music;
    const quotes = userProfile.quotes;
    const favoriteTeams = userProfile.favoriteTeams;
    if (favoriteAthletes) {
        if (favoriteAthletes.length>0) {
            interests.push("HOBBIES_INTERESTS__SPORTS");
            interests.push("INTERESTS__ATHLETES");
            for (let i=0;i<favoriteAthletes.length;i++) {
                interests.push("INTERESTS__ATHLETE_"+favoriteAthletes[i].name.toString().toUpperCase());
            }

        }
    }
    if (music) {
        if (music.data.length>0) {
            interests.push("ART_ENTERTAINMENT__MUSIC");
            interests.push("INTERESTS__MUSIC");

            for (let i=0;i<music.data.length;i++) {
                console.log(music.data[i].name);
                interests.push("ART_ENTERTAINMENT__MUSIC_"+music.data[i].name.toString().toUpperCase());
            }
        }
    }
    if (favoriteTeams) {
        if (favoriteTeams.length>0) {
            interests.push("HOBBIES_INTERESTS__SPORTS");
            interests.push("INTERESTS__SPORTSTEAMS");  
  
            for (let i=0;i<favoriteTeams.length;i++) {
                interests.push("INTERESTS__SPORTSTEAMS_"+favoriteTeams[i].name.toString().toUpperCase());
            } 
        }
    }
    if (quotes) {
        if (quotes.data?.length>0) {
            interests.push("ART_ENTERTAINMENT__BOOKS");   
            interests.push("INTERESTS__QUOTES");   

            for (let i=0;i<quotes.data.length;i++) {
                interests.push("INTERESTS__QUOTES_"+quotes.data[i].name.toString().toUpperCase());
            } 
        }
    }
    //interests.push("LENS");   
    interests.push("CRYPTO__WEB3");   

    return interests;
}
