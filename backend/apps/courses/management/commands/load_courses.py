"""
Comando para cargar cursos de ejemplo (seed).
Uso: python manage.py load_courses
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.courses.models import Course


COURSES_DATA = [
    # Udemy - programming
    {"title": "Python para todos", "description": "Aprende Python desde cero.", "platform": "Udemy", "instructor": "Juan Pérez", "category": "programming", "level": "beginner", "rating": "4.50", "url": "https://udemy.com/python-basics", "image_url": "https://picsum.photos/400/200?r=1"},
    {"title": "JavaScript moderno ES6+", "description": "Domina JavaScript y el ecosistema frontend.", "platform": "Udemy", "instructor": "María García", "category": "programming", "level": "intermediate", "rating": "4.72", "url": "https://udemy.com/js-es6", "image_url": "https://picsum.photos/400/200?r=2"},
    {"title": "Django REST API", "description": "Construye APIs REST con Django.", "platform": "Udemy", "instructor": "Carlos López", "category": "programming", "level": "intermediate", "rating": "4.65", "url": "https://udemy.com/django-rest", "image_url": "https://picsum.photos/400/200?r=3"},
    {"title": "React desde cero", "description": "Desarrollo de interfaces con React.", "platform": "Udemy", "instructor": "Ana Martínez", "category": "programming", "level": "beginner", "rating": "4.58", "url": "https://udemy.com/react-zero", "image_url": "https://picsum.photos/400/200?r=4"},
    {"title": "Node.js backend", "description": "Servidores y APIs con Node.js.", "platform": "Udemy", "instructor": "Luis Rodríguez", "category": "programming", "level": "intermediate", "rating": "4.61", "url": "https://udemy.com/node-backend", "image_url": "https://picsum.photos/400/200?r=5"},
    {"title": "SQL y bases de datos", "description": "Consultas y diseño de bases de datos.", "platform": "Udemy", "instructor": "Elena Sánchez", "category": "programming", "level": "beginner", "rating": "4.55", "url": "https://udemy.com/sql-databases", "image_url": "https://picsum.photos/400/200?r=6"},
    {"title": "Git y GitHub", "description": "Control de versiones y trabajo en equipo.", "platform": "Udemy", "instructor": "Pedro Gómez", "category": "programming", "level": "beginner", "rating": "4.70", "url": "https://udemy.com/git-github", "image_url": "https://picsum.photos/400/200?r=7"},
    {"title": "Docker y contenedores", "description": "Despliegue con Docker.", "platform": "Udemy", "instructor": "Sofia Ruiz", "category": "programming", "level": "intermediate", "rating": "4.68", "url": "https://udemy.com/docker", "image_url": "https://picsum.photos/400/200?r=8"},
    {"title": "TypeScript completo", "description": "TypeScript para proyectos escalables.", "platform": "Udemy", "instructor": "Diego Fernández", "category": "programming", "level": "intermediate", "rating": "4.63", "url": "https://udemy.com/typescript", "image_url": "https://picsum.photos/400/200?r=9"},
    {"title": "Algoritmos y estructuras de datos", "description": "Fundamentos para entrevistas técnicas.", "platform": "Udemy", "instructor": "Laura Morales", "category": "programming", "level": "advanced", "rating": "4.75", "url": "https://udemy.com/algorithms", "image_url": "https://picsum.photos/400/200?r=10"},
    # Coursera - programming & business
    {"title": "Machine Learning", "description": "Introducción al aprendizaje automático.", "platform": "Coursera", "instructor": "Andrew Ng", "category": "programming", "level": "intermediate", "rating": "4.90", "url": "https://coursera.org/ml", "image_url": "https://picsum.photos/400/200?r=11"},
    {"title": "Introducción a la programación", "description": "Primeros pasos en programación.", "platform": "Coursera", "instructor": "University of Toronto", "category": "programming", "level": "beginner", "rating": "4.60", "url": "https://coursera.org/intro-programming", "image_url": "https://picsum.photos/400/200?r=12"},
    {"title": "Data Science con Python", "description": "Análisis de datos y visualización.", "platform": "Coursera", "instructor": "IBM", "category": "programming", "level": "intermediate", "rating": "4.55", "url": "https://coursera.org/ds-python", "image_url": "https://picsum.photos/400/200?r=13"},
    {"title": "Cloud Computing", "description": "AWS y servicios en la nube.", "platform": "Coursera", "instructor": "Amazon", "category": "programming", "level": "intermediate", "rating": "4.52", "url": "https://coursera.org/cloud", "image_url": "https://picsum.photos/400/200?r=14"},
    {"title": "Finanzas para todos", "description": "Conceptos básicos de finanzas personales.", "platform": "Coursera", "instructor": "McMaster University", "category": "business", "level": "beginner", "rating": "4.65", "url": "https://coursera.org/finance", "image_url": "https://picsum.photos/400/200?r=15"},
    {"title": "Marketing digital", "description": "Estrategias de marketing online.", "platform": "Coursera", "instructor": "Google", "category": "business", "level": "beginner", "rating": "4.58", "url": "https://coursera.org/digital-marketing", "image_url": "https://picsum.photos/400/200?r=16"},
    {"title": "Gestión de proyectos", "description": "Metodologías ágiles y tradicionales.", "platform": "Coursera", "instructor": "University of Virginia", "category": "business", "level": "intermediate", "rating": "4.70", "url": "https://coursera.org/project-management", "image_url": "https://picsum.photos/400/200?r=17"},
    {"title": "Liderazgo efectivo", "description": "Habilidades de liderazgo y trabajo en equipo.", "platform": "Coursera", "instructor": "Northwestern", "category": "business", "level": "intermediate", "rating": "4.62", "url": "https://coursera.org/leadership", "image_url": "https://picsum.photos/400/200?r=18"},
    {"title": "Emprendimiento", "description": "De la idea al negocio.", "platform": "Coursera", "instructor": "IE Business School", "category": "business", "level": "beginner", "rating": "4.55", "url": "https://coursera.org/entrepreneurship", "image_url": "https://picsum.photos/400/200?r=19"},
    {"title": "Negociación", "description": "Técnicas de negociación exitosa.", "platform": "Coursera", "instructor": "University of Michigan", "category": "business", "level": "intermediate", "rating": "4.78", "url": "https://coursera.org/negotiation", "image_url": "https://picsum.photos/400/200?r=20"},
    # Platzi - programming & design
    {"title": "Curso de Python", "description": "Python desde cero hasta proyectos.", "platform": "Platzi", "instructor": "Platzi Team", "category": "programming", "level": "beginner", "rating": "4.65", "url": "https://platzi.com/python", "image_url": "https://picsum.photos/400/200?r=21"},
    {"title": "Curso de Frontend", "description": "HTML, CSS y JavaScript.", "platform": "Platzi", "instructor": "Platzi Team", "category": "programming", "level": "beginner", "rating": "4.60", "url": "https://platzi.com/frontend", "image_url": "https://picsum.photos/400/200?r=22"},
    {"title": "Curso de Backend con Node", "description": "APIs y servidores con Node.", "platform": "Platzi", "instructor": "Platzi Team", "category": "programming", "level": "intermediate", "rating": "4.58", "url": "https://platzi.com/backend-node", "image_url": "https://picsum.photos/400/200?r=23"},
    {"title": "Diseño UI/UX", "description": "Interfaces y experiencia de usuario.", "platform": "Platzi", "instructor": "Platzi Team", "category": "design", "level": "beginner", "rating": "4.72", "url": "https://platzi.com/ui-ux", "image_url": "https://picsum.photos/400/200?r=24"},
    {"title": "Figma desde cero", "description": "Diseño de interfaces en Figma.", "platform": "Platzi", "instructor": "Platzi Team", "category": "design", "level": "beginner", "rating": "4.68", "url": "https://platzi.com/figma", "image_url": "https://picsum.photos/400/200?r=25"},
    {"title": "Diseño gráfico", "description": "Principios del diseño gráfico.", "platform": "Platzi", "instructor": "Platzi Team", "category": "design", "level": "beginner", "rating": "4.55", "url": "https://platzi.com/graphic-design", "image_url": "https://picsum.photos/400/200?r=26"},
    {"title": "React y Redux", "description": "Estado global y React.", "platform": "Platzi", "instructor": "Platzi Team", "category": "programming", "level": "intermediate", "rating": "4.62", "url": "https://platzi.com/react-redux", "image_url": "https://picsum.photos/400/200?r=27"},
    {"title": "Base de datos", "description": "SQL, PostgreSQL y MongoDB.", "platform": "Platzi", "instructor": "Platzi Team", "category": "programming", "level": "intermediate", "rating": "4.58", "url": "https://platzi.com/databases", "image_url": "https://picsum.photos/400/200?r=28"},
    {"title": "Branding", "description": "Construcción de marcas.", "platform": "Platzi", "instructor": "Platzi Team", "category": "design", "level": "intermediate", "rating": "4.65", "url": "https://platzi.com/branding", "image_url": "https://picsum.photos/400/200?r=29"},
    {"title": "Illustrator", "description": "Diseño vectorial con Illustrator.", "platform": "Platzi", "instructor": "Platzi Team", "category": "design", "level": "beginner", "rating": "4.60", "url": "https://platzi.com/illustrator", "image_url": "https://picsum.photos/400/200?r=30"},
    # edX - programming, business, music
    {"title": "CS50: Introducción a la informática", "description": "Curso emblemático de Harvard.", "platform": "edX", "instructor": "Harvard University", "category": "programming", "level": "beginner", "rating": "4.85", "url": "https://edx.org/cs50", "image_url": "https://picsum.photos/400/200?r=31"},
    {"title": "Introducción a Linux", "description": "Administración básica de Linux.", "platform": "edX", "instructor": "Linux Foundation", "category": "programming", "level": "beginner", "rating": "4.55", "url": "https://edx.org/linux", "image_url": "https://picsum.photos/400/200?r=32"},
    {"title": "Ciberseguridad", "description": "Fundamentos de seguridad informática.", "platform": "edX", "instructor": "MIT", "category": "programming", "level": "intermediate", "rating": "4.70", "url": "https://edx.org/cybersecurity", "image_url": "https://picsum.photos/400/200?r=33"},
    {"title": "Microeconomía", "description": "Principios de microeconomía.", "platform": "edX", "instructor": "MIT", "category": "business", "level": "beginner", "rating": "4.60", "url": "https://edx.org/microeconomics", "image_url": "https://picsum.photos/400/200?r=34"},
    {"title": "Contabilidad financiera", "description": "Bases de la contabilidad.", "platform": "edX", "instructor": "UC Berkeley", "category": "business", "level": "beginner", "rating": "4.52", "url": "https://edx.org/accounting", "image_url": "https://picsum.photos/400/200?r=35"},
    {"title": "Introducción a la música", "description": "Teoría y apreciación musical.", "platform": "edX", "instructor": "Berklee College", "category": "music", "level": "beginner", "rating": "4.65", "url": "https://edx.org/music-intro", "image_url": "https://picsum.photos/400/200?r=36"},
    {"title": "Guitarra para principiantes", "description": "Aprende a tocar guitarra.", "platform": "edX", "instructor": "Berklee College", "category": "music", "level": "beginner", "rating": "4.58", "url": "https://edx.org/guitar", "image_url": "https://picsum.photos/400/200?r=37"},
    {"title": "Producción musical", "description": "Producción y mezcla con DAW.", "platform": "edX", "instructor": "Berklee College", "category": "music", "level": "intermediate", "rating": "4.62", "url": "https://edx.org/music-production", "image_url": "https://picsum.photos/400/200?r=38"},
    # Más Udemy - design, cooking, music
    {"title": "Photoshop para diseñadores", "description": "Retoque y diseño con Photoshop.", "platform": "Udemy", "instructor": "Carmen Díaz", "category": "design", "level": "beginner", "rating": "4.68", "url": "https://udemy.com/photoshop", "image_url": "https://picsum.photos/400/200?r=39"},
    {"title": "Cocina italiana", "description": "Platos clásicos de la cocina italiana.", "platform": "Udemy", "instructor": "Chef Marco", "category": "cooking", "level": "beginner", "rating": "4.72", "url": "https://udemy.com/italian-cooking", "image_url": "https://picsum.photos/400/200?r=40"},
    {"title": "Repostería básica", "description": "Pasteles, galletas y postres.", "platform": "Udemy", "instructor": "Pastry School", "category": "cooking", "level": "beginner", "rating": "4.65", "url": "https://udemy.com/baking", "image_url": "https://picsum.photos/400/200?r=41"},
    {"title": "Piano para adultos", "description": "Aprende piano desde cero.", "platform": "Udemy", "instructor": "Music Academy", "category": "music", "level": "beginner", "rating": "4.60", "url": "https://udemy.com/piano-adults", "image_url": "https://picsum.photos/400/200?r=42"},
    {"title": "Cocina japonesa", "description": "Sushi, ramen y más.", "platform": "Udemy", "instructor": "Chef Yuki", "category": "cooking", "level": "intermediate", "rating": "4.70", "url": "https://udemy.com/japanese-cooking", "image_url": "https://picsum.photos/400/200?r=43"},
    {"title": "Diseño de logos", "description": "Creación de identidad visual.", "platform": "Udemy", "instructor": "Design Studio", "category": "design", "level": "intermediate", "rating": "4.58", "url": "https://udemy.com/logo-design", "image_url": "https://picsum.photos/400/200?r=44"},
    {"title": "Cocina vegana", "description": "Recetas 100% vegetales.", "platform": "Udemy", "instructor": "Green Kitchen", "category": "cooking", "level": "beginner", "rating": "4.62", "url": "https://udemy.com/vegan-cooking", "image_url": "https://picsum.photos/400/200?r=45"},
    {"title": "Canto y técnica vocal", "description": "Técnica vocal y expresión.", "platform": "Udemy", "instructor": "Vocal Coach", "category": "music", "level": "beginner", "rating": "4.55", "url": "https://udemy.com/singing", "image_url": "https://picsum.photos/400/200?r=46"},
    {"title": "After Effects", "description": "Motion graphics y animación.", "platform": "Udemy", "instructor": "Motion Pro", "category": "design", "level": "intermediate", "rating": "4.68", "url": "https://udemy.com/after-effects", "image_url": "https://picsum.photos/400/200?r=47"},
    {"title": "Cocina mexicana", "description": "Auténtica cocina mexicana.", "platform": "Udemy", "instructor": "Chef Rosa", "category": "cooking", "level": "intermediate", "rating": "4.75", "url": "https://udemy.com/mexican-cooking", "image_url": "https://picsum.photos/400/200?r=48"},
    {"title": "Teoría musical", "description": "Lectura, armonía y ritmo.", "platform": "Udemy", "instructor": "Music Theory Pro", "category": "music", "level": "intermediate", "rating": "4.58", "url": "https://udemy.com/music-theory", "image_url": "https://picsum.photos/400/200?r=49"},
    {"title": "Vue.js 3", "description": "Framework progresivo para el frontend.", "platform": "Udemy", "instructor": "Frontend Master", "category": "programming", "level": "intermediate", "rating": "4.65", "url": "https://udemy.com/vuejs3", "image_url": "https://picsum.photos/400/200?r=50"},
    {"title": "Swift e iOS", "description": "Desarrollo de apps para iPhone.", "platform": "Udemy", "instructor": "Apple Dev", "category": "programming", "level": "intermediate", "rating": "4.60", "url": "https://udemy.com/swift-ios", "image_url": "https://picsum.photos/400/200?r=51"},
    {"title": "Kotlin para Android", "description": "Apps Android con Kotlin.", "platform": "Udemy", "instructor": "Android Pro", "category": "programming", "level": "intermediate", "rating": "4.62", "url": "https://udemy.com/kotlin-android", "image_url": "https://picsum.photos/400/200?r=52"},
    {"title": "Cocina mediterránea", "description": "Dieta y recetas mediterráneas.", "platform": "Coursera", "instructor": "Stanford", "category": "cooking", "level": "beginner", "rating": "4.55", "url": "https://coursera.org/mediterranean", "image_url": "https://picsum.photos/400/200?r=53"},
    {"title": "UX Research", "description": "Investigación en experiencia de usuario.", "platform": "Coursera", "instructor": "Google", "category": "design", "level": "intermediate", "rating": "4.68", "url": "https://coursera.org/ux-research", "image_url": "https://picsum.photos/400/200?r=54"},
]


class Command(BaseCommand):
    help = 'Carga cursos de ejemplo en la base de datos (mínimo 50).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Borrar todos los cursos antes de cargar.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            deleted, _ = Course.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Eliminados {deleted} cursos.'))

        created = 0
        for data in COURSES_DATA:
            _, c = Course.objects.update_or_create(
                title=data['title'],
                platform=data['platform'],
                defaults={
                    'description': data['description'],
                    'instructor': data['instructor'],
                    'category': data['category'],
                    'level': data['level'],
                    'rating': Decimal(data['rating']),
                    'url': data['url'],
                    'image_url': data['image_url'],
                },
            )
            if c:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Cursos en BD: {Course.objects.count()}. Creados en esta ejecución: {created}.'))
