# 🎯 Svelte Crossword Generator

A modern web application built with Svelte that generates interactive crosswords in any language from JSON files containing words and their clues.

## Features

✨ **Multi-language Support** - Works with any language that uses text characters
🎯 **Interactive Puzzle Grid** - Click and type to fill in answers
📝 **Smart Clue Management** - Organized clues with Across/Down sections
🔄 **Generate Multiple Crosswords** - Create new variations from the same word list
👁️ **Show/Hide Answers** - Reveal answers for verification or hints
↺ **Reset Functionality** - Clear answers and start over
📱 **Responsive Design** - Works on desktop and tablet devices
🎨 **Beautiful UI** - Modern gradient design with smooth animations

## Installation

```bash
# Clone the repository
git clone https://github.com/dan-candeira/svelte-crossword-generator.git
cd svelte-crossword-generator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### 1. Prepare Your JSON File

Create a JSON file with an array of words and their clues:

```json
[
  {
    "text": "PYTHON",
    "tip": "Popular programming language"
  },
  {
    "text": "JAVASCRIPT",
    "tip": "Language of the web"
  },
  {
    "text": "SVELTE",
    "tip": "Compiler framework used in this app"
  },
  {
    "text": "CODE",
    "tip": "Instructions for a computer"
  }
]
```

### 2. Upload the File

1. Click the "Choose JSON File" button in the sidebar
2. Select your prepared JSON file
3. The crossword will be generated automatically

### 3. Solve the Puzzle

- Click on any empty cell to select it
- Type letters to fill in answers
- Use the clues on the left as hints
- Press the "Show Answers" button to verify your answers
- Click "Reset" to clear and start over
- Click "Generate New" to create a new layout with the same words

## JSON Format Requirements

Your JSON file must be an array of objects with the following structure:

```typescript
interface Word {
  text: string;      // The word to include in the crossword
  tip: string;       // The clue for the word
}
```

### Requirements:
- All words must be at least 2 characters long
- Text is automatically converted to uppercase
- Tips should be concise and descriptive
- Minimum 3-4 words recommended for a good puzzle

## Project Structure

```
src/
├── components/
│   ├── CrosswordGrid.svelte    # Interactive puzzle grid
│   ├── CluesList.svelte        # Clues display
│   └── FileUploader.svelte     # JSON file upload
├── utils/
│   └── crosswordGenerator.ts   # Crossword generation algorithm
├── types.ts                    # TypeScript interfaces
├── App.svelte                  # Main app component
└── main.ts                     # Entry point
```

## How It Works

1. **File Upload** - User uploads a JSON file containing words and clues
2. **Validation** - The app validates the JSON structure
3. **Word Sorting** - Words are sorted by length (longest first) for optimal placement
4. **Grid Generation** - A 15×15 grid is created with words placed strategically
5. **Intersection Placement** - Words are intersected where they share letters
6. **Clue Organization** - Clues are organized by number and direction (Across/Down)
7. **Interactive Rendering** - The puzzle is displayed with an interactive input grid

## Technologies Used

- **Svelte 4** - Reactive component framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS 3** - Modern styling with gradients and animations

## Building for Production

```bash
npm run build
```

The optimized app will be in the `dist` folder.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Tips for Best Results

1. **Word Selection** - Include words of varying lengths (4-8 letters work well)
2. **Common Letters** - Words sharing common letters (E, A, R, etc.) cross better
3. **Enough Words** - Start with 8-12 words for a balanced puzzle
4. **Clear Clues** - Make clues specific enough to be solvable
5. **Multiple Languages** - Fully supports any language with Unicode characters

## Example JSON Files

### English (Animals)
```json
[
  { "text": "ELEPHANT", "tip": "Large African animal" },
  { "text": "GIRAFFE", "tip": "Tall animal with long neck" },
  { "text": "LION", "tip": "King of the jungle" },
  { "text": "ZEBRA", "tip": "Black and white striped animal" }
]
```

### Spanish (Colores)
```json
[
  { "text": "ROJO", "tip": "Color del fuego" },
  { "text": "AZUL", "tip": "Color del cielo" },
  { "text": "VERDE", "tip": "Color de la hierba" },
  { "text": "AMARILLO", "tip": "Color del sol" }
]
```

### French (Fruits)
```json
[
  { "text": "POMME", "tip": "Fruit rouge" },
  { "text": "BANANE", "tip": "Fruit tropical jaune" },
  { "text": "CERISE", "tip": "Petit fruit rouge" },
  { "text": "ORANGE", "tip": "Fruit agrume" }
]
```

## License

MIT - Feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Enjoy creating and solving crosswords in any language! 🎉**
