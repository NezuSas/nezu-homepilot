from django.contrib import admin
from .models import Scene, NezuRoutine, RoutineAction

@admin.register(Scene)
class SceneAdmin(admin.ModelAdmin):
    list_display = ('name', 'entity_id', 'type', 'created_at')
    search_fields = ('name', 'entity_id')
    list_filter = ('type',)

class RoutineActionInline(admin.TabularInline):
    model = RoutineAction
    extra = 1

@admin.register(NezuRoutine)
class NezuRoutineAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    inlines = [RoutineActionInline]
