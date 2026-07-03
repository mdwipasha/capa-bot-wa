import { makeToggle } from './settings.js';
const command = makeToggle('mute');
command.alias = ['mutegroup'];
export default command;
