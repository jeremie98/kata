'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  DateTimePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MultiSelector,
  SelectWithSearch,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  TypoSmall,
  useToast,
} from '@/lib/ui';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { checkEventConflicts, deleteEvent, updateEvent } from '../actions';
import {
  DetectScheduleConflictsResponse,
  EventReturn,
  EventType,
  UserReturn,
} from '@kata/typings';
import { SupportedLocale } from '@/i18n/locales';
import dayjs from '@kata/day';
import { cn } from '@/utils';
import { useRouter } from '@/i18n/routing';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  event: EventReturn | null;
  potentialParticipants: UserReturn[];
}

export const EventDetails = ({
  open,
  onClose,
  event,
  potentialParticipants,
}: EventFormProps) => {
  const t = useTranslations('events.form');
  const tForm = useTranslations('form');
  const tActions = useTranslations('submit-action');
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [eventConflicts, setEventConflicts] = React.useState<
    DetectScheduleConflictsResponse[]
  >([]);

  const formSchema = z
    .object({
      title: z.string().min(1, {
        message: tForm('required'),
      }),
      dateStart: z.coerce.date().refine((data) => data > new Date(), {
        message: t('dates.validation.start'),
      }),
      dateEnd: z.date(),
      participantIds: z.array(z.string()),
      type: z.enum([EventType.PERSONAL, EventType.PROJECT, EventType.TEAM]),
    })
    .refine((data) => data.dateEnd > data.dateStart, {
      message: t('dates.validation.end'),
      path: ['dateEnd'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title,
      participantIds: event?.participants.map((p) => p.user_id) ?? [],
      type: event?.type,
      dateStart: dayjs(event?.date_start).toDate(),
      dateEnd: dayjs(event?.date_end).toDate(),
    },
  });

  const onUpdate = async (values: z.infer<typeof formSchema>) => {
    const { title, dateStart, dateEnd, type, participantIds } = values;

    try {
      setIsLoading(true);

      const response = await updateEvent(event?.event_id, {
        title,
        dateStart: dayjs(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        dateEnd: dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss'),
        type,
        participantIds,
      });

      if (response.success) {
        setIsLoading(false);
        toast({
          variant: 'success',
          description: tActions('update.success'),
        });
        router.refresh();
        onClose();
      } else {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          description: response.message,
        });
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      const response = await deleteEvent(event?.event_id);

      if (response.success) {
        setIsLoading(false);
        toast({
          variant: 'success',
          description: tActions('delete.success'),
        });
        router.refresh();
        onClose();
      } else {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          description: response.message,
        });
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const onCheckEventConflicts = async (
    dateStart: string,
    dateEnd: string,
    participantIds: string[]
  ) => {
    try {
      setIsLoading(true);

      const response = await checkEventConflicts({
        dateStart: dayjs(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        dateEnd: dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss'),
        participantIds,
      });

      if (response.success && response.data.length > 0) {
        setIsLoading(false);
        setEventConflicts(response.data);
      } else {
        setIsLoading(false);
        setEventConflicts([]);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    form.reset();
    setEventConflicts([]);
  }, [onClose]);

  const defaultValuesRef = React.useRef({
    dateStart: dayjs(event?.date_start).toDate(),
    dateEnd: dayjs(event?.date_end).toDate(),
    participantIds: event?.participants.map((p) => p.user_id) ?? [],
  });

  const { dateStart, dateEnd, participantIds } = form.watch();

  React.useEffect(() => {
    setEventConflicts([]);

    const newParticipants = participantIds.filter(
      (id) => !defaultValuesRef.current.participantIds.includes(id)
    );

    const hasChanged =
      dayjs(dateStart).isSame(defaultValuesRef.current.dateStart) === false ||
      dayjs(dateEnd).isSame(defaultValuesRef.current.dateEnd) === false ||
      newParticipants.length > 0;

    if (hasChanged && dateStart && dateEnd && participantIds.length > 0) {
      onCheckEventConflicts(
        dayjs(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss'),
        newParticipants
      );
    }
  }, [dateStart, dateEnd, participantIds]);

  React.useEffect(() => {
    if (event) {
      const { title, type, date_start, date_end } = event;

      form.reset({
        title,
        participantIds: event.participants.map((p) => p.user_id) ?? [],
        type: type,
        dateStart: dayjs(date_start).toDate(),
        dateEnd: dayjs(date_end).toDate(),
      });

      defaultValuesRef.current = {
        dateStart: dayjs(date_start).toDate(),
        dateEnd: dayjs(date_end).toDate(),
        participantIds: event.participants.map((p) => p.user_id) ?? [],
      };
    }
  }, [event, form.reset]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="" closeClassName="text-black">
        <SheetHeader className="h-16 w-full">
          <SheetTitle className="text-xl">
            {t('update', { title: event?.title })}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('title')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#516f90]">
                    {t('type.label')}
                  </FormLabel>
                  <FormControl>
                    <SelectWithSearch
                      className="bg-[#F3F7F9]"
                      options={[
                        {
                          label: t('type.options.personal'),
                          value: EventType.PERSONAL,
                        },
                        {
                          label: t('type.options.team'),
                          value: EventType.TEAM,
                        },
                        {
                          label: t('type.options.project'),
                          value: EventType.PROJECT,
                        },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#516f90]">
                    {t('dates.start')}
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      currentLocale={SupportedLocale.FR}
                      value={field.value}
                      onChange={field.onChange}
                      className="bg-[#F3F7F9]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#516f90]">
                    {t('dates.end')}
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      currentLocale={SupportedLocale.FR}
                      value={field.value}
                      onChange={field.onChange}
                      className="bg-[#F3F7F9]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#516f90]">
                    {t('participants')}
                  </FormLabel>
                  <FormControl>
                    <MultiSelector
                      {...field}
                      className={cn(
                        'border-none pl-0',
                        !field.value && 'text-muted-foreground'
                      )}
                      options={
                        potentialParticipants.map((p) => ({
                          label: `${p.firstname} ${p.lastname}`,
                          value: p.user_id,
                        })) || []
                      }
                      inputClassName="px-0"
                      badgeClassName="bg-[#0091AE]"
                      hidePlaceholderWhenSelected
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {eventConflicts.length > 0 && (
              <TypoSmall className="text-red-500">
                {t('submit-action.conflicts', {
                  users: eventConflicts
                    .map((c) => `${c.user.firstname} ${c.user.lastname}`)
                    .join(', '),
                })}
              </TypoSmall>
            )}

            <Button
              className="w-full"
              type="submit"
              onClick={form.handleSubmit(onUpdate)}
              disabled={
                !form.formState.isValid ||
                isLoading ||
                eventConflicts.length > 0
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tForm('save')}
            </Button>
          </form>
        </Form>

        <AlertDialog>
          <AlertDialogTrigger className="mt-2 w-full">
            <Button variant="destructive" className="w-full">
              {tForm('delete')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete-event.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete-event.explain')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tForm('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                {tForm('continue')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
};
