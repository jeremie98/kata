'use client';

import * as React from 'react';
import {
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
import { useRouter } from '@/i18n/routing';
import {
  checkEventConflicts,
  createEvent,
  suggestFreeCalendarSlots,
} from '../actions';
import {
  DetectScheduleConflictsResponse,
  EventType,
  SuggestFreeCalendarSlotsResponse,
  UserReturn,
} from '@kata/typings';
import { SupportedLocale } from '@/i18n/locales';
import dayjs from '@kata/day';
import { cn } from '@/utils';
import { useDashboard } from '@/context/DashboardProvider';
import { SuggestionSlots } from './SuggestionSlots';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  potentialParticipants: UserReturn[];
}

export const EventForm = ({
  open,
  onClose,
  potentialParticipants,
}: EventFormProps) => {
  const t = useTranslations('events.form');
  const tForm = useTranslations('form');
  const tActions = useTranslations('submit-action');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useDashboard();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [eventConflicts, setEventConflicts] = React.useState<
    DetectScheduleConflictsResponse[]
  >([]);
  const [slotSuggestions, setSlotSuggestions] = React.useState<
    SuggestFreeCalendarSlotsResponse[]
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
      title: '',
      participantIds: [user.user_id],
      type: EventType.PERSONAL,
    },
  });

  const onCreate = async (values: z.infer<typeof formSchema>) => {
    const { title, dateStart, dateEnd, type, participantIds } = values;

    try {
      setIsLoading(true);

      const response = await createEvent({
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
          description: tActions('create.success'),
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

  const onSuggestFreeCalendarSlots = async (
    dateStart: string,
    dateEnd: string,
    participantIds: string[]
  ) => {
    try {
      setIsLoading(true);

      const response = await suggestFreeCalendarSlots({
        dateStart: dayjs(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        dateEnd: dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss'),
        participantIds,
      });

      if (response.success && response.data.length > 0) {
        setIsLoading(false);
        setSlotSuggestions(response.data);
      } else {
        setIsLoading(false);
        setSlotSuggestions([]);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const onSuggestionClick = (suggestion: SuggestFreeCalendarSlotsResponse) => {
    const { dateStart, dateEnd } = suggestion;

    form.reset({
      title: form.getValues('title') ?? '',
      type: form.getValues('type'),
      dateStart: dayjs(dateStart).toDate(),
      dateEnd: dayjs(dateEnd).toDate(),
      participantIds: form.getValues('participantIds') ?? [user.user_id],
    });

    setEventConflicts([]);
  };

  React.useEffect(() => {
    setEventConflicts([]);
    setSlotSuggestions([]);
    form.reset({
      title: '',
      participantIds: [user.user_id],
      type: EventType.PERSONAL,
    });
  }, [onClose]);

  const { dateStart, dateEnd, participantIds } = form.watch();

  React.useEffect(() => {
    setSlotSuggestions([]);

    if (dateStart && dateEnd && participantIds?.length > 0) {
      onCheckEventConflicts(
        dayjs(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss'),
        participantIds
      );
    }
  }, [dateStart, dateEnd, participantIds]);

  React.useEffect(() => {
    if (eventConflicts.length > 0 && slotSuggestions.length === 0) {
      onSuggestFreeCalendarSlots(
        dayjs(dateStart).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss'),
        participantIds
      );
    }
  }, [eventConflicts]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="" closeClassName="text-black">
        <SheetHeader className="h-16 w-full">
          <SheetTitle className="text-xl">{t('new')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#516f90]">{t('title')}</FormLabel>
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
              onClick={form.handleSubmit(onCreate)}
              disabled={
                !form.formState.isValid ||
                isLoading ||
                eventConflicts.length > 0
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tForm('add')}
            </Button>
          </form>
        </Form>

        {slotSuggestions.length > 0 && (
          <SuggestionSlots
            suggestions={slotSuggestions}
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
