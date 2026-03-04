import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type TableBoxProps = {
  caption?: string;
  tableColumns: { uid: string; name: string }[];
  tableData: any[];
  renderCell?: (item: any, columnKey: React.Key) => React.ReactNode;
  selected?: string[];
  setSelected?: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelect?: (id: string) => void;
  batchAction?: boolean;
};

export default function TableView({
  caption,
  tableColumns,
  tableData,
  renderCell,
  selected,
  setSelected,
  batchAction = false,
}: TableBoxProps) {
  const handleSelect = (id: string) => {
    setSelected?.((prev: string[]) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const allIds = tableData.map((item) => item._id);
    const allSelected = allIds.every((id) => selected?.includes(id));

    setSelected?.(() => (allSelected ? [] : allIds));
  };

  const isAllSelected =
    tableData.length > 0 &&
    tableData.every((item) => selected?.includes(item._id || item.id));

  return (
    <div className="overflow-hidden">
      <Table className="rounded-sm">
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow className="tracking-wider font-medium uppercase dark:text-white">
            <TableHead className="font-semibold tracking-light text-start flex items-center gap-2">
              {batchAction && (
                <Input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              )}
              #
            </TableHead>
            {tableColumns.map((header) => (
              <TableHead
                key={header.uid}
                className="font-semibold text-xs tracking-light text-start"
              >
                {header.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData?.length > 0 ? (
            tableData.map((item, index) => (
              <TableRow
                key={item._id || item.id}
                className="dark:text-muted-foreground"
              >
                <TableCell className="flex items-center gap-2">
                  {batchAction && (
                    <Input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selected?.includes(item._id || item.id)}
                      onChange={() => handleSelect(item._id || item.id)}
                    />
                  )}
                  {index + 1}
                </TableCell>
                {tableColumns.map((header) => (
                  <TableCell key={header.uid}>
                    {renderCell ? renderCell(item, header.uid) : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length + 1}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
