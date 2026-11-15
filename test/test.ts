import { getKeyWords } from '../app/services/keywords';

async function main() {
  const keywords = await getKeyWords();
  console.log(keywords);
}

main().then();