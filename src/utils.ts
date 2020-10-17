function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

export function getRandomColor() {
    return `rgb(${getRandomInt(256)}, ${getRandomInt(256)}, ${getRandomInt(256)})`
}

export function getRandomRect(): [number, number, number, number] {
    return [getRandomInt(50), getRandomInt(50), getRandomInt(500), getRandomInt(500)]
}
