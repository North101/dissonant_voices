import re
import os
import json
import argparse

def json_value(value):
  if type(value) is dict:
    for a in json_obj(value):
      yield a
  elif type(value) is list:
    for a in json_list(value):
      yield a

def json_obj(data):
  for key, value in data.items():
    if key == 'narration':
      yield f"{value['id']}.mp3"
    for a in json_value(value):
      yield a

def json_list(data):
  for value in data:
    for a in json_value(value):
      yield a

def parse_dv(file):
  with open(file) as f:
    data = json.load(f)

  for campaign in data:
    for scenario in campaign['scenarios']:
      for scene in scenario['scenes']:
        yield f'{campaign["id"]}.{scenario["id"]}.{scene["id"]}.mp3'

def parse_arkham_cards(file):
  with open(file) as f:
    data = json.load(f)
  return [
    narration
    for narration in json_value(data)
  ]

def list_arkham_cards_narration(path):
  return [
    narration
    for root, _, files in os.walk(os.path.join(path, 'campaigns'))
    for file in files
    for narration in parse_arkham_cards(os.path.join(root, file))
  ] + [
    narration
    for root, _, files in os.walk(os.path.join(path, 'return_campaigns'))
    for file in files
    for narration in parse_arkham_cards(os.path.join(root, file))
  ]

def list_audio(path):
  return sorted([
    audio
    for root, dirs, files in os.walk(path)
    for audio in files
  ])

def list_dissonant_voices_narration(path):
  return [
    narration
    for narration in parse_dv(os.path.join(path, 'server', 'src', 'db.json'))
  ]

def is_valid_file(parser, arg):
  if not os.path.isdir(arg):
    parser.error(f'The folder {arg} does not exist!')
  else:
    return arg

if __name__ == '__main__':
  parser = argparse.ArgumentParser(description='Process some integers.')
  parser.add_argument(
    '-n',
    dest='narration',
    required=True,
    help='input file',
    metavar='FILE',
    type=lambda x: is_valid_file(parser, x),
  )
  parser.add_argument(
    '-d',
    dest='dv',
    required=True,
    help='input file',
    metavar='FILE',
    type=lambda x: is_valid_file(parser, x),
  )
  parser.add_argument(
    '-a',
    dest='audio',
    required=True,
    help='input file',
    metavar='FILE',
    type=lambda x: is_valid_file(parser, x),
  )

  args = parser.parse_args()
  arkham_cards_narration = list_arkham_cards_narration(args.narration)
  dissonant_voices_narration = list_dissonant_voices_narration(args.dv)
  audios_files = list_audio(args.audio)

  a = {
    narration: {
      'arkham_cards': narration in arkham_cards_narration,
      'dissonant_voices': narration in dissonant_voices_narration,
      'audio': narration in audios_files,
    }
    for narration in (arkham_cards_narration + dissonant_voices_narration + audios_files)
  }
  for narration, exists in a.items():
    if all(exists.values()):
      continue

    print(narration)
    for type, found in exists.items():
      print(f'  {type}: {"✔️" if found else "❌"}')