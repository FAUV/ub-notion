'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskInput } from '@/lib/validations/schemas';
import { FormField, Input, Select, Button } from '@/lib/components/ui/form-field';
import { Modal } from '@/lib/components/ui/modal';
import { useCreateEntity, useUpdateEntity, useProjects, useAreas } from '@/lib/hooks/use-entities';
import { useToast } from '@/lib/components/ui/toast';
import type { Task } from '@/lib/types/entities';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess?: () => void;
}

export function TaskFormEnhanced({ isOpen, onClose, task, onSuccess }: TaskFormProps) {
  const { success, error: showError } = useToast();
  const createMutation = useCreateEntity('tasks');
  const updateMutation = useUpdateEntity('tasks');
  const { data: projects } = useProjects();
  const { data: areas } = useAreas();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      status: 'Por hacer',
      priority: 'Media',
      tags: [],
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        status: task.status || 'Por hacer',
        priority: task.priority || 'Media',
        area: task.area || undefined,
        due: task.due || undefined,
        scheduled: task.scheduled || undefined,
        energy: task.energy || undefined,
        effort: task.effort || undefined,
        tags: task.tags || [],
      });
    } else {
      reset({
        title: '',
        status: 'Por hacer',
        priority: 'Media',
        tags: [],
      });
    }
  }, [task, reset, isOpen]);

  const onSubmit = async (data: TaskInput) => {
    try {
      if (task) {
        await updateMutation.mutateAsync({ id: task.id, data });
        success('Tarea actualizada', 'La tarea se actualizó correctamente');
      } else {
        await createMutation.mutateAsync(data);
        success('Tarea creada', 'La tarea se creó correctamente');
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showError('Error', err.message || 'Ocurrió un error al guardar la tarea');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Editar Tarea' : 'Nueva Tarea'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Título" required error={errors.title?.message} htmlFor="title">
          <Input
            id="title"
            {...register('title')}
            error={!!errors.title}
            placeholder="Nombre de la tarea"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estado" htmlFor="status">
            <Select id="status" {...register('status')}>
              <option value="Por hacer">Por hacer</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
              <option value="Bloqueado">Bloqueado</option>
            </Select>
          </FormField>

          <FormField label="Prioridad" htmlFor="priority">
            <Select id="priority" {...register('priority')}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </Select>
          </FormField>
        </div>

        {areas && areas.length > 0 && (
          <FormField label="Área" htmlFor="area">
            <Select id="area" {...register('area')}>
              <option value="">Seleccionar área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.title}>
                  {area.title}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fecha límite" htmlFor="due">
            <Input
              id="due"
              type="date"
              {...register('due')}
            />
          </FormField>

          <FormField label="Programado" htmlFor="scheduled">
            <Input
              id="scheduled"
              type="date"
              {...register('scheduled')}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Energía" htmlFor="energy">
            <Select id="energy" {...register('energy')}>
              <option value="">Sin especificar</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </Select>
          </FormField>

          <FormField label="Esfuerzo" htmlFor="effort">
            <Select id="effort" {...register('effort')}>
              <option value="">Sin especificar</option>
              <option value="XS">XS (&lt; 30 min)</option>
              <option value="S">S (30 min - 1 h)</option>
              <option value="M">M (1-2 h)</option>
              <option value="L">L (2-4 h)</option>
              <option value="XL">XL (&gt; 4 h)</option>
            </Select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {task ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
