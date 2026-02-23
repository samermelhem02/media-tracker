export function getDefaultImage(type: string): string {
  switch (type) {
    case "movie":
      return "/defaults/default-movie.jpg";
    case "series":
      return "/defaults/default-series.jpg";
    case "music":
      return "/defaults/default-music.jpg";
    case "game":
      return "/defaults/default-game.jpg";
    default:
      return "/defaults/default-generic.jpg";
  }
}
