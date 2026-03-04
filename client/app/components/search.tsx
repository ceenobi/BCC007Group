import { Form, useSearchParams, useNavigation, useSubmit } from "react-router";
import { useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "./ui/input";
import { Search as LucideSearch, Loader, X } from "lucide-react";

export default function Search({
  id,
  placeholder,
}: {
  id: string;
  placeholder?: string;
}) {
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("query");
  const query = searchParams.get("query") || "";

  const debouncedSubmit = useDebouncedCallback((form: HTMLFormElement) => {
    const isFirstSearch = query === "";
    submit(form, {
      replace: !isFirstSearch,
    });
  }, 500);

  const handleQueryDelete = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    searchParams.delete("query");
    submit(searchParams);
  };

  return (
    <>
      <Form
        className="relative flex-1 bg-transparent border-none"
        role="search"
        id={id}
        onChange={(event) => {
          debouncedSubmit(event.currentTarget);
        }}
      >
        {searching ? (
          <Loader className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        {query && (
          <X
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={handleQueryDelete}
          />
        )}
        <Input
          placeholder={placeholder}
          name="query"
          aria-label="Search"
          defaultValue={query}
          ref={inputRef}
          className="pl-10 placeholder:text-[14px] border-none bg-inherit focus:ring-0 focus:border-none focus:outline-none focus:ring-offset-0"
          type="search"
        />
      </Form>
    </>
  );
}
