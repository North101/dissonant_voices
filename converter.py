import json
import sys
import re
from pathlib import Path

def filter_title(str):
    return re.sub('[^0-9a-zA-Z_]+', '', str.lower().replace('\n', '').replace(' ', '_'))

def convert_time(str):
    values = str.split(':', 3)
    value = float(values.pop())
    while values:
        value += int(values.pop()) * 60
    
    return value

def convert(filename):
    with open(filename, 'r') as f:
        data = [
            (convert_time(start_time), filter_title(title), title.replace('\n', ''))
            for start_time, title in (
                line.split(' - ', 1)
                for line in f.readlines()
            )
        ]

    with open(filename.with_suffix('.label'), 'w') as f:
        for index, (start_time, id, title) in enumerate(data[:-1]):
            print(index, start_time, data[index + 1][0], id, title)
        f.write('\n'.join(
            f"{start_time}\t{data[index + 1][0]}\t{filename.stem}.{id}"
            for index, (start_time, id, title) in enumerate(data[:-1])
        ))

    with open(filename.with_suffix('.json'), 'w') as f:
        json.dump({
            "id": filename.stem.split('.')[-1],
            "name": filename.stem.split('.')[-1].replace('_', ' ').title(),
            "scenes": [
                {
                    "id": id,
                    "name": title,
                }
                for (start_time, id, title) in data[:-1]
            ],
        }, f, indent=2)

for arg in sys.argv[1:]:
    filename = Path(arg)
    if not filename.exists():
        raise ValueError(filename)

    if not filename.is_file():
        raise ValueError(filename)

    convert(filename)