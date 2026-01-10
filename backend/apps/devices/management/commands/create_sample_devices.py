from django.core.management.base import BaseCommand
from apps.devices.models import Device

class Command(BaseCommand):
    help = 'Crea dispositivos de ejemplo para pruebas'

    def handle(self, *args, **kwargs):
        devices = [
            {
                'name': 'Luz Sala Principal',
                'type': 'light',
                'room': 'Sala',
                'is_on': True,
                'value': '80',
                'unit': '%',
                'is_online': True,
            },
            {
                'name': 'Luz Cocina',
                'type': 'light',
                'room': 'Cocina',
                'is_on': False,
                'is_online': True,
            },
            {
                'name': 'Termostato',
                'type': 'climate',
                'room': 'Sala',
                'is_on': True,
                'value': '22',
                'unit': '°C',
                'is_online': True,
            },
            {
                'name': 'Sensor Puerta Principal',
                'type': 'sensor',
                'room': 'Entrada',
                'is_on': False,
                'value': 'Cerrado',
                'is_online': True,
            },
            {
                'name': 'Cerradura Inteligente',
                'type': 'lock',
                'room': 'Entrada',
                'is_on': True,
                'is_online': True,
            },
            {
                'name': 'Ventilador Dormitorio',
                'type': 'switch',
                'room': 'Dormitorio',
                'is_on': False,
                'is_online': True,
            },
            {
                'name': 'Luz Dormitorio',
                'type': 'light',
                'room': 'Dormitorio',
                'is_on': False,
                'is_online': True,
            },
            {
                'name': 'Luz Baño',
                'type': 'light',
                'room': 'Baño',
                'is_on': False,
                'is_online': True,
            },
        ]

        for device_data in devices:
            device, created = Device.objects.get_or_create(
                name=device_data['name'],
                defaults=device_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Creado: {device.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'- Ya existe: {device.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n¡Listo! {Device.objects.count()} dispositivos en total.'))
