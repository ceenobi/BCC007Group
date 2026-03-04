import { Button } from "~/components/ui/button";
import { useState } from "react";
import Modal from "~/components/modal";
import { Separator } from "~/components/ui/separator";
import FormBox from "~/components/formBox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "react-router";
import { z } from "zod";
import { authFields, genderData } from "~/lib/constants";
import { useEffect } from "react";
import ActionButton from "~/components/actionButton";
import { Loader } from "lucide-react";
import { UpdateUserSchema, type UserData } from "~/lib/dataSchema";
import { toast } from "sonner";

export default function EditAccount({ user }: { user: UserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  const form = useForm<z.infer<typeof UpdateUserSchema>>({
    resolver: zodResolver(UpdateUserSchema) as any,
    defaultValues: {
      name: user.name,
      phone: user.phone,
      occupation: user.occupation,
      location: user.location,
      gender: user.gender,
      dateOfBirth: (user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "") as any,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success("User updated successfully");
      form.reset();
      setIsOpen(false);
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error("Failed to update user!");
    }
  }, [fetcher.data, form]);

  const filterFields = authFields.filter((field) =>
    [
      "name",
      "phone",
      "occupation",
      "location",
      "gender",
      "dateOfBirth",
    ].includes(field.name),
  );
  const isSubmitting = fetcher.state === "submitting";

  const handleClose = () => {
    form.reset();
    setIsOpen(false);
  };

  const onSubmit = (data: z.infer<typeof UpdateUserSchema>) => {
    fetcher.submit(
      {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : undefined,
      } as any,
      {
        method: "patch",
        action: "/settings?type=account",
      },
    );
  };
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="rounded-sm bg-blue-500 hover:bg-blue-600 text-white hover:text-white cursor-pointer"
      >
        Edit Profile
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Update user account
          </h1>
        </div>
        <Separator />
        <div className="p-4  max-h-[60vh] overflow-y-auto">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="updateAccountForm"
            className="space-y-4"
          >
            <FormBox
              form={form}
              data={filterFields}
              getSelectData={genderData}
              classname="w-full"
            />
          </form>
        </div>
        <Separator />
        <div className="p-4 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
          <ActionButton
            type="button"
            text="Cancel"
            classname="w-full sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
            onClick={handleClose}
            variant="outline"
          />
          <ActionButton
            text="Update"
            type="submit"
            form="updateAccountForm"
            classname="w-full sm:w-auto bg-blue-500 py-4 hover:bg-blue-600 text-white hover:text-white"
            disabled={isSubmitting}
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
          />
        </div>
      </Modal>
    </>
  );
}
