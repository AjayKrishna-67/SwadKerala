'use client';

import { DialogFooter } from '~/components/ui/dialog';
import type React from 'react';
import {
  Outlet,
  useLoaderData,
  useSearchParams,
  useLocation,
  useActionData,
  useNavigation,
} from '@remix-run/react';
import {
  type LoaderFunctionArgs,
  json,
  redirect,
  type DataFunctionArgs,
} from '@remix-run/server-runtime';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import { useEffect, useState, useRef } from 'react';
import { getSessionStorage } from '~/sessions';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, validationError } from 'remix-validated-form';
import { z } from 'zod';
import {
  requestUpdateCustomerEmailAddress,
  updateCustomer,
} from '~/providers/account/account';
import useToggleState from '~/utils/use-toggle-state';
import { replaceEmptyString } from '~/utils/validation';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { User, Edit, Mail, Check, Phone } from 'lucide-react';
import { HighlightedButton } from '~/components/HighlightedButton';
import AccountHeader from '~/components/account/AccountHeader';

export enum FormIntent {
  UpdateEmail = 'updateEmail',
  UpdateDetails = 'updateDetails',
  UpdatePhone = 'updatePhone',
}

export const validator = withZod(
  z.object({
    title: z.string(),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    phoneNumber: z.string().optional(),
  }),
);

export const phoneNumberValidator = withZod(
  z.object({
    phoneNumber: z
      .string()
      .min(1, { message: 'Phone number is required' })
      .regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
      .refine((val) => {
        // Remove any whitespace and check if it's exactly 10 digits
        const cleaned = val.replace(/\s+/g, '');
        return /^\d{10}$/.test(cleaned);
      }, {
        message: 'Phone number must be exactly 10 digits',
      }),
  }),
);

const changeEmailValidator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email('Must be a valid email'),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
);

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const sessionStorage = await getSessionStorage();
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie'),
    );
    const authToken = session.get('authToken');
    const channelToken = session.get('channelToken');
    console.log('Session tokens:', { authToken, channelToken });

    const { activeCustomer } = await getActiveCustomerDetails({ request });

    if (!activeCustomer) {
      session.unset('authToken');
      session.unset('channelToken');
      return redirect('/sign-in', {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      });
    }

    // Check if phone number is missing
    const url = new URL(request.url);
    const showPhoneModal = url.searchParams.get('requirePhone') === 'true';
    const needsPhoneNumber = !activeCustomer.phoneNumber || activeCustomer.phoneNumber.trim() === '';

    return json({ 
      activeCustomer,
      needsPhoneNumber,
      showPhoneModal: showPhoneModal || needsPhoneNumber,
    });
  } catch (error) {
    console.error('Loader error:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}

export type FormError = {
  message: string;
  intent?: string;
};

type EmailSavedResponse = {
  newEmailAddress: string;
};

type CustomerUpdatedResponse = {
  customerUpdated: true;
};

export async function action({ request }: DataFunctionArgs) {
  const body = await request.formData();
  const intent = body.get('intent') as FormIntent | null;

  const formError = (formError: FormError, init?: number | ResponseInit) => {
    return json<FormError>(formError, init);
  };

  if (intent === FormIntent.UpdatePhone) {
    const result = await phoneNumberValidator.validate(body);
    if (result.error) return validationError(result.error);

    const { phoneNumber } = result.data;

    try {
      await updateCustomer({ phoneNumber }, { request });
      return json<CustomerUpdatedResponse>(
        { customerUpdated: true },
        { status: 200 },
      );
    } catch (error: any) {
      console.error('Update phone error:', error);
      if (
        error.message.includes('401') ||
        error.message.includes('Unauthorized')
      ) {
        const sessionStorage = await getSessionStorage();
        const session = await sessionStorage.getSession(
          request.headers.get('Cookie'),
        );
        session.unset('authToken');
        session.unset('channelToken');
        return redirect('/sign-in', {
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        });
      }
      return formError(
        {
          message: error.message || 'Failed to update phone number',
          intent: FormIntent.UpdatePhone,
        },
        { status: 400 },
      );
    }
  }

  if (intent === FormIntent.UpdateEmail) {
    const result = await changeEmailValidator.validate(body);
    if (result.error) return validationError(result.error);
    const { email, password } = result.data;
    const updateResult = await requestUpdateCustomerEmailAddress(
      password,
      email,
      { request },
    );

    if (updateResult.__typename !== 'Success') {
      return formError(
        { message: 'Failed to update email', intent: FormIntent.UpdateEmail },
        { status: 401 },
      );
    }

    return json<EmailSavedResponse>(
      { newEmailAddress: email },
      { status: 200 },
    );
  }

  if (intent === FormIntent.UpdateDetails) {
    const result = await validator.validate(body);
    if (result.error) return validationError(result.error);

    const { title, firstName, lastName, phoneNumber } = result.data;

    try {
      await updateCustomer(
        { title, firstName, lastName, phoneNumber },
        { request },
      );
      return json<CustomerUpdatedResponse>(
        { customerUpdated: true },
        { status: 200 },
      );
    } catch (error: any) {
      console.error('Update details error:', error);
      return formError(
        {
          message: 'Failed to update customer details',
          intent: FormIntent.UpdateDetails,
        },
        { status: 400 },
      );
    }
  }

  return formError({ message: 'No valid form intent' }, { status: 401 });
}

export default function AccountDashboard() {
  const { activeCustomer, needsPhoneNumber, showPhoneModal } = useLoaderData<typeof loader>();
  const { firstName, lastName, emailAddress, phoneNumber, title } =
    activeCustomer!;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const actionDataHook = useActionData<typeof action>();
  const { state } = useNavigation();

  const [formError, setFormError] = useState<FormError>();
  const [emailSavedResponse, setEmailSavedResponse] =
    useState<EmailSavedResponse>();
  const [showChangeEmailModal, openChangeEmailModal, closeChangeEmailModal] =
    useToggleState(false);
  const [showPhoneNumberModal, openPhoneNumberModal, closePhoneNumberModal] =
    useToggleState(showPhoneModal || needsPhoneNumber);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneFormRef = useRef<HTMLFormElement>(null);

  const fullName = `${title ? title + ' ' : ''}${firstName} ${lastName}`;
  const isAccountDetailsPage = location.pathname === '/account';

  useEffect(() => {
    if (!actionDataHook) return;

    if ((actionDataHook as any).newEmailAddress) {
      setEmailSavedResponse(actionDataHook as EmailSavedResponse);
      closeChangeEmailModal();
      window.location.href = '/account';
      return;
    }

    if ((actionDataHook as any).customerUpdated) {
      setIsEditing(false);
      setFormError(undefined);
      closePhoneNumberModal();
      window.location.href = '/account';
      return;
    }

    if ((actionDataHook as any).message) {
      setFormError(actionDataHook as FormError);
      return;
    }
  }, [actionDataHook, closeChangeEmailModal]);

  useEffect(() => {
    formRef.current?.reset();
  }, [activeCustomer]);

  return (
    <div className="min-h-screen bg-background">
      <AccountHeader
        activeCustomer={{
          ...activeCustomer,
          phoneNumber: activeCustomer.phoneNumber || null,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isAccountDetailsPage ? (
          <AccountDetailsContent
            activeCustomer={activeCustomer}
            fullName={fullName}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            emailSavedResponse={emailSavedResponse}
            openChangeEmailModal={openChangeEmailModal}
            formError={formError}
            formRef={formRef}
            state={state}
            phoneNumber={phoneNumber}
            showPhoneNumberModal={showPhoneNumberModal}
            openPhoneNumberModal={openPhoneNumberModal}
            closePhoneNumberModal={closePhoneNumberModal}
            phoneFormRef={phoneFormRef}
            needsPhoneNumber={needsPhoneNumber}
          />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

function AccountDetailsContent({
  activeCustomer,
  fullName,
  isEditing,
  setIsEditing,
  emailSavedResponse,
  openChangeEmailModal,
  formError,
  formRef,
  state,
  phoneNumber,
  showPhoneNumberModal,
  openPhoneNumberModal,
  closePhoneNumberModal,
  phoneFormRef,
  needsPhoneNumber,
}: {
  activeCustomer: any;
  fullName: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  emailSavedResponse: EmailSavedResponse | undefined;
  openChangeEmailModal: () => void;
  formError: FormError | undefined;
  formRef: React.RefObject<HTMLFormElement>;
  state: string;
  phoneNumber?: string | null;
  showPhoneNumberModal: boolean;
  openPhoneNumberModal: () => void;
  closePhoneNumberModal: () => void;
  phoneFormRef: React.RefObject<HTMLFormElement>;
  needsPhoneNumber: boolean;
}) {
  const { firstName, lastName, title, emailAddress } = activeCustomer;

  return (
    <div className="space-y-8 pt-10">
      {/* Contact Information Card */}
      <Card className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Your basic contact details
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="default"
                onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-spice hover:bg-spice-600 text-white rounded-md transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <ValidatedForm
              validator={validator}
              formRef={formRef}
              method="post"
              id="details"
              defaultValues={{
                title: activeCustomer.title ?? 'None',
                firstName: activeCustomer.firstName,
                lastName: activeCustomer.lastName,
                phoneNumber: activeCustomer.phoneNumber ?? '',
              }}
            >
              <input
                type="hidden"
                name="intent"
                value={FormIntent.UpdateDetails}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Title <span className="text-spice">*</span>
                  </Label>
                  <Select name="title" defaultValue={title || 'None'}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-gold focus:border-navy">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Miss.">Miss.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    First Name <span className="text-spice">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="h-11 border-gray-300 focus:ring-gold focus:border-navy"
                    defaultValue={firstName || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Last Name <span className="text-spice">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="h-11 border-gray-300 focus:ring-gold focus:border-navy"
                    defaultValue={lastName || ''}
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    className="h-11 border-gray-300 focus:ring-gold focus:border-navy"
                    defaultValue={phoneNumber || ''}
                    placeholder="Enter phone number"
                  />
                </div> */}
              </div>
              {formError && formError.intent === FormIntent.UpdateDetails && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    {formError.message}
                  </p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <HighlightedButton
                  type="submit"
                  isSubmitting={state === 'submitting'}
                  className="h-11 px-6 bg-spice hover:bg-spice-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" /> Save Changes
                </HighlightedButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-11 px-6 border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </ValidatedForm>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-600">
                    Full Name
                  </Label>
                  <p className="text-base font-medium text-gray-900">
                    {replaceEmptyString(fullName)}
                  </p>
                </div>
                {/* <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <p className="text-base font-medium text-gray-900">
                    {replaceEmptyString(phoneNumber) || (
                      <span className="text-gray-500 italic">Not Provided</span>
                    )}
                  </p>
                </div> */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number Card */}
      <Card className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Phone className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Phone Number
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {phoneNumber ? 'Your contact number' : 'Add your phone number to complete your profile'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="default"
              onClick={openPhoneNumberModal}
              className="h-10 px-4 bg-spice hover:bg-spice-600 text-white rounded-md transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" /> {phoneNumber ? 'Update' : 'Add'} Phone
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold uppercase text-gray-600 flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <p className="text-base font-medium text-gray-900">
                {phoneNumber ? (
                  phoneNumber
                ) : (
                  <span className="text-gray-500 italic">Not Provided</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Update Modal */}
      <Dialog open={showPhoneNumberModal} onOpenChange={(open) => {
        if (!open && !needsPhoneNumber) {
          closePhoneNumberModal();
        }
      }}>
        <DialogContent className="sm:max-w-[500px] !bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold !text-gray-900">
              {phoneNumber ? 'Update Phone Number' : 'Add Phone Number'}
            </DialogTitle>
            {needsPhoneNumber && (
              <p className="text-sm !text-gray-600 mt-2">
                Please add your phone number to complete your profile.
              </p>
            )}
          </DialogHeader>
          <ValidatedForm
            validator={phoneNumberValidator}
            formRef={phoneFormRef}
            method="post"
            id="phone-number"
            defaultValues={{
              phoneNumber: phoneNumber || '',
            }}
          >
            <input
              type="hidden"
              name="intent"
              value={FormIntent.UpdatePhone}
            />
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-semibold !text-gray-700"
                >
                  Phone Number <span className="text-spice">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  required
                  type="tel"
                  maxLength={10}
                  className="h-11 border-gray-300 focus:ring-gold focus:border-navy !text-gray-900 !bg-white"
                  placeholder="Enter 10 digit phone number"
                  defaultValue={phoneNumber || ''}
                  onInput={(e) => {
                    // Only allow digits
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/\D/g, '').slice(0, 10);
                  }}
                />
                <p className="text-xs !text-gray-500">
                  Enter exactly 10 digits (e.g., 9876543210)
                </p>
              </div>
              {formError && formError.intent === FormIntent.UpdatePhone && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    {formError.message}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex gap-3 w-full">
                {!needsPhoneNumber && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closePhoneNumberModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <HighlightedButton
                  type="submit"
                  isSubmitting={state === 'submitting'}
                  className={`flex-1 bg-spice hover:bg-spice-600 text-white ${needsPhoneNumber ? 'w-full' : ''}`}
                >
                  {phoneNumber ? 'Update' : 'Add'} Phone Number
                </HighlightedButton>
              </div>
            </DialogFooter>
          </ValidatedForm>
        </DialogContent>
      </Dialog>

      {/* Email Address Card */}
      <Card className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Mail className="h-5 w-5 text-emerald-700" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Email Address
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-base font-medium text-gray-900 break-all">
                {emailAddress}
              </p>
              <Badge className="bg-green-50 text-green-700 border-green-200 rounded-full px-3 py-1">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
