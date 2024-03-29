import argparse
import json
import os
from pathlib import Path
from typing import Generator


def parse_dv(file: Path) -> Generator[str, None, None]:
  with file.open() as f:
    data = json.load(f)

  for campaign in data:
    for scenario in campaign['scenarios']:
      for scene in scenario['scenes']:
        yield f'{campaign["id"]}.{scenario["id"]}.{scene["id"]}.mp3'


def iter_arkham_cards_value(value) -> Generator[str, None, None]:
  if isinstance(value, dict):
    yield from iter_arkham_cards_obj(value)
  elif isinstance(value, list):
    yield from iter_arkham_cards_list(value)


def iter_arkham_cards_obj(data) -> Generator[str, None, None]:
  for key, value in data.items():
    if key == 'narration':
      yield f"{value['id']}.mp3"
    yield from iter_arkham_cards_value(value)


def iter_arkham_cards_list(data) -> Generator[str, None, None]:
  for value in data:
    yield from iter_arkham_cards_value(value)


def parse_arkham_cards(file: Path) -> Generator[str, None, None]:
  with file.open() as f:
    data = json.load(f)

  yield from iter_arkham_cards_value(data)


def list_arkham_cards_narration(path: Path) -> set[str]:
  return {
      narration
      for root, _, files in os.walk(path / 'campaigns')
      for file in files
      if file.endswith('.json')
      for narration in parse_arkham_cards(Path(root, file))
  } | {
      narration
      for root, _, files in os.walk(path / 'return_campaigns')
      for file in files
      if file.endswith('.json')
      for narration in parse_arkham_cards(Path(root, file))
  }


def list_audio(path: Path) -> set[str]:
  return {
      audio
      for _, _, files in os.walk(path)
      for audio in files
      if audio.endswith('.mp3')
  }


def list_dissonant_voices_narration(path: Path) -> set[str]:
  return {
      narration
      for narration in parse_dv(path / 'src' / 'server' / 'data.json')
  }


def is_valid_file(parser: argparse.ArgumentParser, arg: str) -> Path:
  path = Path(arg)
  if not path.is_dir():
    parser.error(f'The folder {arg} does not exist!')

  return path


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument(
      dest='narration',
      help='input file',
      type=lambda x: is_valid_file(parser, x),
  )
  parser.add_argument(
      dest='dv',
      help='input file',
      type=lambda x: is_valid_file(parser, x),
  )
  parser.add_argument(
      dest='audio',
      help='input file',
      type=lambda x: is_valid_file(parser, x),
  )

  args = parser.parse_args()
  arkham_cards_narration = list_arkham_cards_narration(args.narration)
  dissonant_voices_narration = list_dissonant_voices_narration(args.dv)
  audios_files = list_audio(args.audio)

  narration = {
      filename: {
          'arkham_cards': filename in arkham_cards_narration,
          'dissonant_voices': filename in dissonant_voices_narration,
          'audio': filename in audios_files,
      }
      for filename in sorted(arkham_cards_narration | dissonant_voices_narration | audios_files)
  }
  for narration, exists in narration.items():
    if all(exists.values()):
      continue

    print(narration)
    for src, found in exists.items():
      print(f'  {src}: {"✅" if found else "❌"}')


if __name__ == '__main__':
  main()
