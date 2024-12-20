'use client';

import * as React from 'react';
import {
  Button,
  DatePicker,
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
  useToast,
} from '@/lib/ui';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { createEvent } from '../actions';
import { EventType, UserReturn } from '@kata/typings';
import { SupportedLocale } from '@/i18n/locales';
import dayjs from '@kata/day';
import { cn } from '@/utils';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  potentialParticipants: UserReturn[]
}

const EventForm = ({ open, onClose, potentialParticipants }: EventFormProps) => {
  const t = useTranslations('events.form');
  const tForm = useTranslations('form');
  const tActions = useTranslations('submit-action');
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const formSchema = z.object({
    title: z.string().min(1, {
      message: tForm('required'),
    }),
    dateStart: z.date(),
    dateEnd: z.date(),
    participantIds: z.array(z.string()),
    type: z.enum([EventType.PERSONAL, EventType.PROJECT, EventType.TEAM]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      participantIds: [],
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
          description: tActions('create.error'),
        });
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    form.reset();
  }, [onClose]);

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
                  <FormLabel>
                    {t('title')}
                  </FormLabel>
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
                            value: EventType.PERSONAL
                        },
                        {
                            label: t('type.options.team'),
                            value: EventType.TEAM
                        },
                        {
                            label: t('type.options.project'),
                            value: EventType.PROJECT
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
                <FormItem className="space-y-0">
                  <FormLabel className="text-xs text-[#516f90]">
                    {t('dateStart')}
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      classname="w-full border-none px-0"
                      locale={SupportedLocale.FR}
                      value={field.value}
                      fromDate={dayjs().year(1900).toDate()}
                      toDate={dayjs().year(2100).toDate()}
                      onChange={field.onChange}
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
                <FormItem className="space-y-0">
                  <FormLabel className="text-xs text-[#516f90]">
                  {t('dateEnd')}
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      classname="w-full border-none px-0"
                      locale={SupportedLocale.FR}
                      value={field.value}
                      fromDate={dayjs().year(1900).toDate()}
                      toDate={dayjs().year(2100).toDate()}
                      onChange={field.onChange}
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
            <Button
              className="w-full"
              type="submit"
              onClick={form.handleSubmit(onCreate)}
              disabled={!form.formState.isValid || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tForm('add')}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EventForm;
