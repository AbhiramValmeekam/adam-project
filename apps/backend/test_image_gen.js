const text = 'Can you tell me what is hackathon?';
const topics = text.toLowerCase().includes('hackathon') ? ['technology', 'coding', 'computer', 'programmer'] : ['education'];
console.log('Topics for hackathon:', topics);
topics.forEach(t => console.log(`https://source.unsplash.com/300x200/?${t}`));