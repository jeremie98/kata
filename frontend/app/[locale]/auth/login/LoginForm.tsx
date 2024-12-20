'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  InputPassword,
  TypoH3,
  useToast,
} from '@/lib';

export function LoginForm() {
  const t = useTranslations('login');
  const tForm = useTranslations('form');
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<boolean>(false);

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: tForm('required') })
      .email({ message: t('form.email.validation') }),
    password: z.string().min(1, {
      message: tForm('required'),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitError(false);
      setIsLoading(true);

      const response = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (response.ok && !response.error) {
        setIsLoading(false);
        toast({
          variant: 'success',
          description: t('form.submit.success'),
        });
        router.push('/dashboard');
      } else {
        setSubmitError(true);
        setIsLoading(false);
      }
    } catch (err) {
      setSubmitError(true);
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-background flex w-full min-w-min max-w-sm text-white drop-shadow-2xl">
      <CardContent className="flex w-full flex-col items-center justify-center space-y-5 p-10">
        <TypoH3 className="text-black">{t('title')}</TypoH3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t('form.email.placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-end gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <InputPassword
                        placeholder={t('form.password.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('form.submit.button')}
            </Button>
          </form>
        </Form>

        {submitError && (
          <Alert variant="destructive" className="bg-[#FDEDEE] text-black">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('form.submit.error')}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
