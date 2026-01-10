import { Device } from "../types/device";

export const mockDevices: Device[] = [
  {
    id: "1",
    name: "Luz Sala Principal",
    type: "light",
    room: "Sala",
    isOn: true,
    value: 80,
    unit: "%",
    isOnline: true,
  },
  {
    id: "2",
    name: "Luz Cocina",
    type: "light",
    room: "Cocina",
    isOn: false,
    isOnline: true,
  },
  {
    id: "3",
    name: "Termostato",
    type: "climate",
    room: "Sala",
    isOn: true,
    value: 22,
    unit: "°C",
    isOnline: true,
  },
  {
    id: "4",
    name: "Sensor Puerta Principal",
    type: "sensor",
    room: "Entrada",
    isOn: false, // Closed
    value: "Cerrado",
    isOnline: true,
  },
  {
    id: "5",
    name: "Cerradura Inteligente",
    type: "lock",
    room: "Entrada",
    isOn: true, // Locked
    isOnline: true,
  },
  {
    id: "6",
    name: "Ventilador",
    type: "switch",
    room: "Dormitorio",
    isOn: false,
    isOnline: false,
  },
];
