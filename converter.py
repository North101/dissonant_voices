import json
import re
import sys
from pathlib import Path
from typing import NamedTuple


class Scene(NamedTuple):
  start_time: float
  id: str
  title: str


def convert_to_id(value: str):
  return re.sub('[^0-9a-zA-Z_]+', '', value.lower().replace('\n', '').replace(' ', '_'))


def convert_time(value: str) -> float:
  result = 0.0
  for i, v in enumerate(reversed(value.split(':', 3))):
    result += float(v) * (60 ** i)
  return result


def convert_title(value: str) -> str:
  return re.sub(r'^R(\d+)$', r'Resolution \1', value.replace('\n', '').replace('No R', 'No Resolution'))


def convert(filename: Path):
  with filename.open() as f:
    data = [
        Scene(
            start_time=convert_time(start_time),
            id=convert_to_id(convert_title(title)),
            title=convert_title(title),
        )
        for start_time, title in (
            line.split(' - ', 1)
            for line in f.readlines()
        )
    ]

  with filename.with_suffix('.label').open('w') as f:
    for index, scene in enumerate(data[:-1]):
      print(index, scene.start_time, data[index + 1][0], scene.id, scene.title)

    f.write('\n'.join(
        f'{scene.start_time}\t{data[index + 1][0]}\t{filename.stem}.{scene.id}'
        for index, scene in enumerate(data[:-1])
    ))

  with filename.with_suffix('.json').open('w') as f:
    json.dump({
        'id': filename.stem.split('.')[-1],
        'name': filename.stem.split('.')[-1].replace('_', ' ').title(),
        'scenes': [
            {
              'id': scene.id,
              'name': scene.title,
              }
            for scene in data[:-1]
        ],
    }, f, indent=2)


def main():
  for arg in sys.argv[1:]:
    filename = Path(arg)
    if not filename.exists():
      raise ValueError(filename)

    if not filename.is_file():
      raise ValueError(filename)

    convert(filename)


main()
