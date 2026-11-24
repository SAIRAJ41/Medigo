import type { EmergencyCard } from '../../types/EmergencyCard';

/**
 * Seed knowledge base: 40 common first-aid conditions for rural India, one entry per condition (SPEC section 7).
 * Copied into the Dexie `emergencyCards` table on first run, and re-copied when KB_VERSION in firstRun.ts changes.
 * severityGuidance holds the first-aid steps, one step per line. keywords are extra words people use (offline matching).
 * severityColor / severityLevel / seekFacility are only the default rating for the condition (offline replies, sample history);
 * the model rates each real report itself.
 *
 * All text is written in our own words. The "Source" line above each card names the public guidance it follows
 * (not a quote and not a page citation).
 * General first-aid wording for demonstration. Have it reviewed by a medical professional before real use.
 *
 * Keyword tips: every keyword can match a card on its own, so avoid generic words (hot, water, fall, pain, bit, well,
 * cough, swelling, passed). The regression checks in scripts/rag-eval/queries.json guard the known ones.
 * Words are lower-cased and lightly stemmed ("bleeding" -> "bleed"), so one form is usually enough.
 * Check changes with: node --experimental-transform-types --no-warnings scripts/rag-eval/run.mjs
 */
export const seedEmergencyCards: EmergencyCard[] = [
  // Source: Indian Red Cross first-aid guidance (burns); WHO burns fact sheet.
  {
    cardId: 1,
    conditionName: 'Burns',
    keywords: ['burn', 'burned', 'burnt', 'scald', 'scalded', 'fire', 'blister', 'boiling', 'steam'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: false,
    severityGuidance: [
      'Cool the burn under clean running water for 10 to 20 minutes.',
      'Remove rings, watches or tight items near the area before swelling starts.',
      'Do not apply ice, butter, oil or toothpaste.',
      'Cover loosely with a clean, non-stick cloth. Do not burst blisters.',
      'Seek medical care if the burn is larger than the palm, on the face, hands or genitals, or blisters are large.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (bleeding); ICRC first aid.
  {
    cardId: 2,
    conditionName: 'Severe bleeding',
    keywords: ['bleeding', 'bleed', 'blood', 'cut', 'wound', 'gash', 'stab', 'puncture'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Press firmly on the wound with a clean cloth and keep pressing.',
      'If blood soaks through, add more cloth on top. Do not remove the first one.',
      'Raise the injured limb above heart level if there is no suspected fracture.',
      'Call 112 if bleeding does not slow within 10 minutes or the wound is deep.',
      'Use a tourniquet only if you are trained and the limb bleeding is life-threatening.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (choking).
  {
    cardId: 3,
    conditionName: 'Choking',
    keywords: ['choking', 'choke', 'choked', 'swallowed', 'throat'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'If the person can cough or speak, encourage them to keep coughing.',
      'If they cannot breathe or speak, call 112 or ask someone to call.',
      'Give up to 5 firm back blows between the shoulder blades.',
      'Then give up to 5 abdominal thrusts (pressure just above the navel, inward and upward).',
      'Repeat until the object comes out or help arrives. Start CPR if the person becomes unresponsive and you are trained.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (fractures, sprains).
  {
    cardId: 4,
    conditionName: 'Fracture or sprain',
    keywords: ['fracture', 'broken', 'bone', 'sprain', 'sprained', 'ankle', 'twisted', 'wrist'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: true,
    severityGuidance: [
      'Keep the injured part still. Do not try to straighten it.',
      'Support it in the position found using padding, a sling or a splint.',
      'Apply a cold pack wrapped in cloth for 15 to 20 minutes to reduce swelling.',
      'Do not let the person put weight on the injury.',
      'Get medical care. Call 112 if there is severe pain, deformity, numbness, or an open wound with bone visible.',
    ].join('\n'),
  },
  // Source: WHO snakebite envenoming guidance; Indian national snakebite management protocol.
  {
    cardId: 5,
    conditionName: 'Snakebite',
    keywords: ['snake', 'snakebite', 'bitten', 'fang', 'venom', 'saanp'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Keep the person calm and as still as possible. Movement spreads venom faster.',
      'Call 112 and get to a hospital with antivenom urgently.',
      'Keep the bitten limb still and at or slightly below heart level. Remove rings and tight items.',
      'Do not cut the wound, suck out venom, apply ice, or tie a tight tourniquet.',
      'Note the time of the bite and, if safe, remember the snake appearance. Do not try to catch it.',
    ].join('\n'),
  },
  // Source: WHO and Indian Red Cross home-care guidance (fever).
  {
    cardId: 6,
    conditionName: 'Fever',
    keywords: ['fever', 'temperature', 'chills', 'shivering', 'bukhar'],
    severityColor: 'YELLOW',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Rest and drink plenty of fluids.',
      'Dress lightly and keep the room comfortably cool. Sponge with lukewarm water if uncomfortable.',
      'Use a fever medicine only as directed on its label.',
      'Seek care if fever lasts more than 3 days, is very high, or comes with stiff neck, rash, confusion or trouble breathing.',
      'Seek care at once for fever in a baby under 3 months.',
    ].join('\n'),
  },
  // Source: NDMA heat wave guidelines; Indian Red Cross first-aid guidance (heat stroke).
  {
    cardId: 7,
    conditionName: 'Heat stroke',
    keywords: ['heat', 'sun', 'sunstroke', 'dehydrated'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112. Heat stroke is an emergency.',
      'Move the person to a cool, shaded place and remove extra clothing.',
      'Cool the body quickly with wet cloths, water and fanning, especially neck, armpits and groin.',
      'If fully awake, give small sips of cool water. Do not give drinks if confused or drowsy.',
      'Keep cooling until help arrives.',
    ].join('\n'),
  },
  // Source: WHO poisoning guidance; Indian Red Cross first-aid guidance (poisoning).
  {
    cardId: 8,
    conditionName: 'Poisoning',
    keywords: ['poison', 'poisoned', 'swallowed', 'drank', 'pesticide', 'chemical', 'kerosene', 'overdose', 'inhaled', 'spray', 'fumes', 'tablets'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112 or a poison information centre straight away.',
      'Do not make the person vomit and do not give anything to drink unless told to.',
      'Keep the container, label or sample of what was swallowed to show the doctor.',
      'If poison is on skin or in the eyes, rinse with clean running water for 15 minutes.',
      'If the person is drowsy or unconscious, lay them on their side and watch their breathing.',
    ].join('\n'),
  },
  // Source: WHO rabies guidance; Indian national rabies control programme (wound washing).
  {
    cardId: 9,
    conditionName: 'Animal bite',
    keywords: ['dog', 'bite', 'bitten', 'animal', 'monkey', 'cat', 'rabies', 'scratch', 'stray'],
    severityColor: 'YELLOW',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Wash the wound with soap and clean running water for at least 15 minutes.',
      'Cover with a clean dressing. Do not apply chilli, turmeric or other home remedies.',
      'Go to a hospital the same day for assessment and anti-rabies and tetanus protection.',
      'Do this even for a small bite or scratch from a dog, monkey or cat.',
      'Note which animal and whether it was a stray or pet.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (fainting).
  {
    cardId: 10,
    conditionName: 'Fainting',
    keywords: ['faint', 'fainted', 'unconscious', 'dizzy', 'collapsed', 'blackout', 'behosh'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: false,
    severityGuidance: [
      'Lay the person flat on their back and raise their legs about 30 cm.',
      'Loosen tight clothing and make sure they have fresh air.',
      'Check that they are breathing. If not, call 112 and start CPR if trained.',
      'If they do not wake within 1 minute, call 112.',
      'Once awake, let them sit up slowly and give water if they are fully alert.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (nosebleed).
  {
    cardId: 11,
    conditionName: 'Nosebleed',
    keywords: ['nose', 'nosebleed', 'bleeding'],
    severityColor: 'GREEN',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Sit upright and lean slightly forward. Do not tilt the head back.',
      'Pinch the soft part of the nose firmly for 10 minutes without releasing.',
      'Breathe through the mouth and spit out any blood that collects.',
      'Seek care if bleeding lasts more than 20 minutes or follows a blow to the head.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (eye injuries).
  {
    cardId: 12,
    conditionName: 'Eye injury',
    keywords: ['eye', 'eyes', 'dust', 'splash', 'vision'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: true,
    severityGuidance: [
      'Do not rub the eye.',
      'For chemicals or dust, rinse with clean water for at least 15 minutes, holding the eyelids open.',
      'For a blow or a stuck object, do not press or remove the object. Cover loosely with a clean cup or pad.',
      'Get medical care urgently for any chemical splash, pain, or vision changes.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (electrical injuries).
  {
    cardId: 13,
    conditionName: 'Electric shock',
    keywords: ['electric', 'shock', 'electrocuted', 'current', 'wire', 'socket'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Do not touch the person until the power is switched off at the main switch.',
      'If you cannot switch off, push the source away with a dry wooden stick. Stand on dry material.',
      'Call 112. Even if the person seems fine, they need a medical check.',
      'Check breathing. Start CPR if the person is not breathing and you are trained.',
      'Treat any burns by cooling with clean water and covering loosely.',
    ].join('\n'),
  },
  // Source: WHO drowning prevention guidance; Indian Red Cross first-aid guidance (drowning).
  {
    cardId: 14,
    conditionName: 'Drowning',
    keywords: ['drown', 'drowning', 'drowned', 'pool', 'river', 'pond', 'doob', 'dooba', 'kuan', 'kuwa'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112 or shout for help. Do not put yourself in danger. Reach with a pole or throw a rope or float.',
      'Once out of the water, check if the person is breathing.',
      'If not breathing, start CPR with rescue breaths if you are trained.',
      'If breathing, lay them on their side, keep them warm and watch them until help arrives.',
      'Everyone who nearly drowned needs a hospital check, even if they seem well.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (bites and stings). Scorpions have their own card (16+).
  {
    cardId: 15,
    conditionName: 'Insect sting',
    keywords: ['sting', 'stung', 'bee', 'wasp', 'insect', 'hornet'],
    severityColor: 'GREEN',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Scrape out any visible sting sideways with a card or fingernail. Do not squeeze it.',
      'Wash the area and apply a cold pack wrapped in cloth.',
      'Watch for 30 minutes for signs of an allergic reaction.',
      'Call 112 at once if there is swelling of the face or throat, trouble breathing, dizziness or widespread rash.',
      'Seek care for stings inside the mouth or throat, or many stings at once.',
    ].join('\n'),
  },

  // ---- Added in knowledge base version 2 ----

  // Source: Indian Red Cross basic life support guidance; 108 ambulance phone-guided CPR (hands-only).
  {
    cardId: 16,
    conditionName: 'Cardiac arrest',
    keywords: ['cpr', 'pulse', 'heartbeat', 'unresponsive', 'lifeless', 'resuscitation', 'collapsed'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Check if the person responds and is breathing normally. Gasping is not normal breathing.',
      'If not, call 112 and put the phone on speaker. Ask someone to bring an AED (defibrillator) if one is near.',
      'Push hard and fast in the centre of the chest, about 5 cm deep, 100 to 120 times a minute.',
      'If you are trained, give 2 rescue breaths after every 30 pushes. If not, keep pushing without stopping.',
      'Do not stop until the person breathes normally, trained help takes over, or you are too tired to go on.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (heart attack); WHO cardiovascular disease guidance.
  {
    cardId: 17,
    conditionName: 'Heart attack',
    keywords: ['chest', 'sweating', 'angina', 'heartattack', 'tightness', 'crushing', 'squeezing', 'heaviness', 'dil', 'seene', 'chhati', 'ghabrahat'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112 at once. Chest pain, pressure or heaviness lasting more than a few minutes may be a heart attack.',
      'Help the person sit down and rest, half-sitting with knees bent is often easiest. Loosen tight clothing.',
      'If they have a heart tablet or spray prescribed by a doctor, help them take it.',
      'If they are an adult, awake, not allergic and have no bleeding problem, give one aspirin (300 mg) to chew slowly.',
      'Stay with them. If they become unresponsive and stop breathing normally, start CPR.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (stroke, FAST check); WHO stroke guidance.
  {
    cardId: 18,
    conditionName: 'Stroke',
    keywords: ['paralysis', 'paralysed', 'paralyzed', 'numbness', 'numb', 'slurred', 'slurring', 'drooping', 'lakwa', 'lakva', 'brain'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Check FAST: Face drooping, Arm weakness, Speech slurred. If you see any, it is Time to call 112.',
      'Note the time the signs started. Doctors need this to choose treatment.',
      'Keep the person lying on their side with the head slightly raised, or sitting if awake and comfortable.',
      'Do not give food, drink or medicine. Swallowing may not be safe.',
      'Stay with them and watch their breathing. Start CPR if they stop breathing normally.',
    ].join('\n'),
  },
  // Source: WHO epilepsy guidance; Indian Red Cross first-aid guidance (seizures).
  {
    cardId: 19,
    conditionName: 'Seizure',
    keywords: ['seizures', 'siezure', 'seizer', 'fits', 'convulsion', 'convulsions', 'epilepsy', 'epileptic', 'jerking', 'mirgi', 'daura'],
    severityColor: 'YELLOW',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Stay calm. Move hard or sharp things away and put something soft under the head.',
      'Do not hold the person down and do not put anything in their mouth, not even a spoon or keys.',
      'Time the seizure. Call 112 if it lasts more than 5 minutes, another one starts, or it is their first seizure.',
      'When the jerking stops, turn them onto their side so saliva can drain out.',
      'Stay until they are fully awake. Call 112 if they are injured, pregnant, have trouble breathing, or do not wake up.',
    ].join('\n'),
  },
  // Source: WHO asthma guidance; Indian Red Cross first-aid guidance (asthma).
  {
    cardId: 20,
    conditionName: 'Asthma attack',
    keywords: ['asthma', 'asthama', 'wheeze', 'wheezing', 'inhaler', 'breathless', 'breathlessness', 'dama', 'saans'],
    severityColor: 'YELLOW',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Help the person sit upright, leaning slightly forward. Stay calm and loosen tight clothing.',
      'Help them use their reliever inhaler (usually blue): 1 puff every 30 to 60 seconds, up to 10 puffs, with a spacer if they have one.',
      'Move them away from smoke, dust, or whatever started the attack.',
      'Call 112 if they cannot speak full sentences, their lips turn blue, they get drowsy, or the inhaler does not help.',
      'While waiting, keep giving puffs as above. Start CPR if they stop breathing normally.',
    ].join('\n'),
  },
  // Source: WHO anaphylaxis guidance; Indian Red Cross first-aid guidance (severe allergic reaction).
  {
    cardId: 21,
    conditionName: 'Allergic reaction',
    keywords: ['allergy', 'allergic', 'anaphylaxis', 'hives', 'rash', 'epipen', 'adrenaline', 'itchy', 'itching', 'urticaria', 'lip', 'lips', 'prawn', 'shellfish', 'seafood', 'khujli'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112 at once if there is swelling of the face, lips or tongue, trouble breathing, wheezing or fainting.',
      'If the person has an adrenaline auto-injector, help them use it in the outer thigh.',
      'Let them sit up if breathing is hard. If they feel faint, lay them down with legs raised.',
      'Remove the cause if you can, such as a sting, food or medicine.',
      'If there is no improvement after 5 minutes and a second injector is available, use it. Start CPR if they stop breathing.',
    ].join('\n'),
  },
  // Source: WHO diarrhoea and ORS guidance (home-made salt-sugar solution).
  {
    cardId: 22,
    conditionName: 'Diarrhoea',
    keywords: ['diarrhea', 'diarrohea', 'motions', 'dast', 'dehydration', 'dehydrated', 'ors', 'watery', 'stool', 'cholera'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: false,
    severityGuidance: [
      'Give ORS (oral rehydration solution) in small, frequent sips, and more after each loose stool.',
      'If there is no ORS packet, mix 6 level teaspoons of sugar and half a level teaspoon of salt in 1 litre of clean, boiled and cooled water.',
      'Keep eating light food and keep breastfeeding babies. Give zinc to children if a health worker advises it.',
      'Wash hands with soap after the toilet and before handling food.',
      'Seek care urgently for blood in the stool, very little urine, sunken eyes, drowsiness, or a baby or elderly person who cannot drink.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (head injuries).
  {
    cardId: 23,
    conditionName: 'Head injury',
    keywords: ['concussion', 'skull', 'forehead', 'bump', 'helmet'],
    severityColor: 'YELLOW',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Keep the person still and resting with head and shoulders slightly raised. If the neck may be hurt, do not move it.',
      'Press a clean cloth on any bleeding scalp wound. Hold a cold pack wrapped in cloth on a bump.',
      'Call 112 if they were knocked out, are confused or very sleepy, vomit again and again, have a fit, or have blood or clear fluid from the nose or ears.',
      'Do not leave them alone for the next 24 hours. Watch for headache getting worse or unusual behaviour.',
      'If they become unresponsive, check breathing. Start CPR if they are not breathing normally.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (spinal injuries); ICRC first aid.
  {
    cardId: 24,
    conditionName: 'Spinal injury',
    keywords: ['spine', 'backbone', 'diving', 'dive', 'neck', 'paralysed', 'paralyzed', 'tingling', 'numb', 'roof', 'vertebra', 'reedh'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Suspect a spine injury after a fall from height, road accident, diving, or a hard blow to the head, neck or back.',
      'Call 112. Do not move the person unless they are in danger, such as fire or traffic.',
      'Hold the head still, in line with the body, with both hands or with rolled cloths on each side.',
      'Do not let them sit up, turn the neck or walk. Keep them warm.',
      'If they vomit or stop breathing, roll them onto their side keeping head, neck and body in one line, with helpers if possible. Start CPR if needed.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (chest injuries); ICRC first aid.
  {
    cardId: 25,
    conditionName: 'Chest injury',
    keywords: ['rib', 'ribs', 'ribcage', 'lung', 'lungs', 'sucking', 'pasli'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112 for any chest wound, coughing of blood, or broken ribs with trouble breathing.',
      'Help the person sit half-upright, leaning towards the injured side if that eases breathing.',
      'For an open wound, cover it with a clean pad and press lightly. Do not seal it fully with plastic.',
      'If an object is stuck in the chest, do not pull it out. Pad around it to keep it still.',
      'Watch their breathing. If they become unresponsive and stop breathing normally, start CPR.',
    ].join('\n'),
  },
  // Source: WHO basic emergency care (abdominal pain); Indian Red Cross first-aid guidance.
  // Named "Stomach ache" so the generic word "pain" is not a match term.
  {
    cardId: 26,
    conditionName: 'Stomach ache',
    keywords: ['abdomen', 'abdominal', 'belly', 'tummy', 'stomachache', 'appendix', 'appendicitis', 'colic', 'gastric', 'acidity', 'pet', 'pait'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: true,
    severityGuidance: [
      'Let the person rest in the most comfortable position, often lying with knees bent.',
      'Give only small sips of water. Do not give food, alcohol or strong pain medicine until a doctor has seen them.',
      'A warm (not hot) water bottle wrapped in cloth may ease mild cramping.',
      'Call 112 or go to hospital if the pain is severe or sudden, the belly is hard or swollen, there is blood in vomit or black stool, high fever, or the woman may be pregnant.',
      'Pain that moves to the lower right side and gets worse when moving may be appendicitis and needs a doctor the same day.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (dental injuries).
  {
    cardId: 27,
    conditionName: 'Tooth or jaw injury',
    keywords: ['tooth', 'teeth', 'dental', 'gum', 'gums', 'molar', 'daant', 'dant'],
    severityColor: 'YELLOW',
    severityLevel: 'LOW',
    seekFacility: true,
    severityGuidance: [
      'Rinse the mouth gently with clean water and press a clean cloth on bleeding gums for 10 minutes.',
      'If an adult tooth is knocked out, hold it by the white top, not the root. Do not scrub it.',
      'Put it back in the socket if you can, or keep it in milk, and see a dentist within 1 hour.',
      'Hold a cold pack wrapped in cloth on the face to reduce swelling.',
      'Call 112 if the jaw looks out of shape, the mouth cannot close, or there is trouble breathing or swallowing.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (foreign bodies in ear and nose).
  {
    cardId: 28,
    conditionName: 'Object in ear or nose',
    keywords: ['ears', 'nostril', 'nostrils', 'bead', 'pebble', 'kaan', 'insect'],
    severityColor: 'YELLOW',
    severityLevel: 'LOW',
    seekFacility: true,
    severityGuidance: [
      'Do not poke inside with cotton buds, pins or tweezers. This pushes the object deeper.',
      'For the nose, close the clear nostril and ask the person to blow out gently through the blocked side.',
      'For a live insect in the ear, tilt the head with that ear up and pour in a little lukewarm clean water or oil to float it out, only if there is no ear injury or discharge.',
      'For anything else in the ear, tilt the head to that side and shake gently.',
      'If it does not come out, see a doctor. Go urgently for a button battery or magnet, or if there is pain, bleeding or trouble breathing.',
    ].join('\n'),
  },
  // Source: NDMA lightning safety guidelines; Indian Red Cross first-aid guidance.
  {
    cardId: 29,
    conditionName: 'Lightning strike',
    keywords: ['lightning', 'lightening', 'thunder', 'thunderstorm', 'thunderbolt', 'bijli', 'vajrapat'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'It is safe to touch a person struck by lightning. They do not carry an electric charge.',
      'If the storm is still close, move to a safer place away from open fields, tall trees and water.',
      'Call 112. Check breathing and start CPR at once if they are not breathing normally.',
      'If several people are hit, help first those who look lifeless. They may recover with CPR.',
      'Cool and cover any burns. Everyone struck by lightning needs a hospital check.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (road accidents); 108/112 emergency response guidance; Good Samaritan rules (MoRTH).
  {
    cardId: 30,
    conditionName: 'Road accident',
    keywords: ['accident', 'crash', 'crashed', 'collision', 'overturned', 'takkar', 'pedestrian', 'motorbike'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Make the scene safe first: warn other traffic, switch off the vehicle engine if you can, and do not smoke.',
      'Call 112 and give the exact location and the number of people hurt.',
      'Do not move the injured unless there is fire or other danger. Do not remove a rider\'s helmet.',
      'Press firmly on any heavy bleeding with a clean cloth. Keep the injured warm, still and talking.',
      'If someone is not breathing normally, start CPR. Helpers are protected by the Good Samaritan law in India.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (chemical burns); WHO burns guidance.
  {
    cardId: 31,
    conditionName: 'Chemical burn',
    keywords: ['acid', 'alkali', 'bleach', 'cement', 'caustic', 'chuna', 'tezaab', 'tezab', 'phenyl'],
    severityColor: 'YELLOW',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Protect your own hands with gloves or a cloth. Brush off any dry powder first, such as lime or cement.',
      'Rinse the area under cool running water for at least 20 minutes.',
      'Take off soaked clothing and jewellery while rinsing, without pulling it over the face.',
      'For the eyes, rinse with clean water for 20 minutes holding the eyelids open, then go to hospital.',
      'Cover loosely with a clean cloth and get medical care. Keep the container to show the doctor. Call 112 for large burns or burns to the face, eyes or throat.',
    ].join('\n'),
  },
  // Source: WHO maternal danger signs; Indian Red Cross first-aid guidance (emergency childbirth); 102/108 maternal transport.
  {
    cardId: 32,
    conditionName: 'Pregnancy emergency',
    keywords: ['pregnant', 'pregnent', 'labour', 'labor', 'contractions', 'delivery', 'miscarriage', 'garbhvati', 'prasav', 'trimester', 'bleeding', 'vaginal', 'spotting'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Call 112 for heavy bleeding, fits, severe headache or blurred vision, severe belly pain, the baby moving less, or waters breaking before 37 weeks.',
      'Help the woman lie on her left side. Keep her warm and calm.',
      'If the baby is coming now, wash your hands, lay down clean cloths, and let the baby come by itself. Do not pull the baby or the cord.',
      'Dry the baby, place it skin to skin on the mother\'s chest and cover both. Leave the cord for the health worker if you have no clean tools.',
      'Take mother and baby to the nearest health centre as soon as possible, even if all seems well.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (diabetic emergencies); WHO diabetes guidance.
  // Named "Hypoglycaemia" so the generic word "low" is not a match term.
  {
    cardId: 33,
    conditionName: 'Hypoglycaemia',
    keywords: ['hypoglycemia', 'hypo', 'diabetic', 'diabetes', 'insulin', 'glucose', 'madhumeh', 'sweating', 'shaky'],
    severityColor: 'YELLOW',
    severityLevel: 'MEDIUM',
    seekFacility: false,
    severityGuidance: [
      'Low sugar in a person with diabetes can cause shaking, sweating, confusion, hunger or strange behaviour.',
      'If they are awake and can swallow, give sugar fast: 3 to 4 teaspoons of sugar or glucose in water, a glass of fruit juice, or sweets.',
      'Wait 15 minutes. If they do not feel better, give sugar again.',
      'Once better, give a snack such as roti, bread or biscuits.',
      'Do not give food or drink if they are drowsy or unconscious. Lay them on their side and call 112.',
    ].join('\n'),
  },
  // Source: WHO guidance on vomiting and dehydration (ORS); Indian Red Cross home care.
  {
    cardId: 34,
    conditionName: 'Vomiting',
    keywords: ['vomit', 'vomited', 'vomitting', 'puke', 'puking', 'nausea', 'nauseous', 'ulti', 'ultee'],
    severityColor: 'YELLOW',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Let the person rest sitting up, or lying on their side so they cannot choke.',
      'Stop food for a short while. Give small sips of ORS or clean water every few minutes.',
      'When vomiting stops, start light food such as rice, banana or khichdi.',
      'If there is also diarrhoea, keep giving ORS to replace lost fluid.',
      'Seek care for blood or green vomit, severe belly pain, a head injury, signs of dehydration, or vomiting longer than 24 hours (6 hours in a baby).',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (suffocation, smoke and fume inhalation).
  {
    cardId: 35,
    conditionName: 'Suffocation',
    keywords: ['suffocate', 'suffocating', 'smothered', 'strangled', 'strangulation', 'noose', 'smoke', 'charcoal', 'monoxide', 'ghutan', 'plastic', 'polythene'],
    severityColor: 'RED',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'Remove the cause quickly if it is safe: take off anything around the neck or face, or get the person into fresh air.',
      'For smoke, gas or charcoal fumes, open doors and windows first, do not stay in the room, and never light a match.',
      'Call 112.',
      'Check breathing. If they are not breathing normally, start CPR.',
      'If breathing, lay them on their side and watch them until help arrives. Everyone needs a hospital check.',
    ].join('\n'),
  },
  // Source: Indian Academy of Pediatrics scorpion sting guidance; Indian Red Cross first-aid guidance.
  {
    cardId: 36,
    conditionName: 'Scorpion sting',
    keywords: ['scorpion', 'scorpions', 'scorpian', 'stung', 'bichhu', 'bichoo', 'bichu', 'vinchu', 'vinchoo'],
    severityColor: 'RED',
    severityLevel: 'MEDIUM',
    seekFacility: true,
    severityGuidance: [
      'Keep the person calm and still. Remove rings or tight items near the sting.',
      'Wash the area with soap and water and hold a cold pack wrapped in cloth on it.',
      'Go to a hospital quickly, especially for a child. Some Indian scorpions can harm the heart and lungs, and hospitals have good treatment.',
      'Do not cut the area, suck it, or apply chilli, herbs or a tight band.',
      'Call 112 at once for heavy sweating, vomiting, cold hands and feet, chest pain, trouble breathing or fits.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (minor wounds); WHO tetanus guidance.
  {
    cardId: 37,
    conditionName: 'Minor cut or scrape',
    keywords: ['scraped', 'graze', 'grazed', 'abrasion', 'papercut', 'nick', 'plaster', 'bandaid', 'kharoch'],
    severityColor: 'GREEN',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Wash your hands, then rinse the cut under clean running water to remove dirt.',
      'Press gently with a clean cloth for a few minutes to stop the bleeding.',
      'Apply an antiseptic if you have one and cover with a clean plaster or dressing.',
      'Change the dressing every day and keep it clean and dry.',
      'See a health worker if it becomes red, swollen, warm or full of pus, if it came from rusty metal or soil and tetanus shots are not up to date, or if it will not close.',
    ].join('\n'),
  },
  // Source: Indian Red Cross first-aid guidance (burns); WHO burns guidance.
  {
    cardId: 38,
    conditionName: 'Minor burn',
    keywords: ['sunburn', 'sunburnt', 'tawa', 'utensil', 'kettle'],
    severityColor: 'GREEN',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Cool the burn under cool running water for 20 minutes. Do not use ice.',
      'Remove rings or tight items from the area before it swells.',
      'Do not apply toothpaste, butter, ghee, oil or turmeric. Leave small blisters unbroken.',
      'Cover loosely with a clean, non-stick cloth or cling film.',
      'See a health worker if the burn is bigger than the person\'s palm, on the face, hands, feet, joints or private parts, if the skin looks white or charred, or if the person is a baby or elderly.',
    ].join('\n'),
  },
  // Source: NDMA heat wave guidelines (heat cramps); Indian Red Cross first-aid guidance.
  {
    cardId: 39,
    conditionName: 'Heat cramps',
    keywords: ['cramp', 'cramps', 'spasm', 'spasms', 'nas', 'ainthan'],
    severityColor: 'YELLOW',
    severityLevel: 'LOW',
    seekFacility: false,
    severityGuidance: [
      'Stop the activity and rest in a cool, shaded place.',
      'Drink ORS, coconut water, buttermilk with a pinch of salt, or water with a little salt and sugar.',
      'Gently stretch and massage the cramping muscle.',
      'Do not go back to hard work or play for a few hours after the cramps stop.',
      'Seek care if cramps last more than 1 hour, or if there is confusion, fainting or very hot, dry skin, which may be heat stroke.',
    ].join('\n'),
  },
  // Source: WHO/IMNCI danger signs in young infants; Indian Academy of Pediatrics fever guidance.
  {
    cardId: 40,
    conditionName: 'Fever in a baby',
    keywords: ['infant', 'infants', 'newborn', 'neonate', 'babies', 'shishu', 'navjat', 'navjaat'],
    severityColor: 'YELLOW',
    severityLevel: 'HIGH',
    seekFacility: true,
    severityGuidance: [
      'A baby under 3 months with any fever (38°C or more) needs a doctor today, even if they seem well.',
      'Go to hospital at once if the baby is very sleepy or hard to wake, will not feed, has a fit, a bulging soft spot, a rash that does not fade when pressed, or fast or hard breathing.',
      'Keep feeding often. Breastfeed more often to prevent dehydration.',
      'Dress the baby in light clothes. Do not wrap tightly or sponge with cold water.',
      'Give fever medicine only in the dose a doctor or the label gives for the baby\'s age and weight. Never give aspirin to children.',
    ].join('\n'),
  },
];
