
"use client"

import { useState, useRef, useEffect } from "react"
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import debounce from "lodash.debounce";

const ItemType = "CONTENT_ITEM"

interface DraggedItem {
  index: number;
}

function DraggableContentItem({
  item,
  index,
  moveItem,
  expandedItems,
  handleToggleExpand,
}: {
  item: { title: string; content: string };
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  expandedItems: Set<string>;
  handleToggleExpand: (title: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [, drop] = useDrop<DraggedItem>({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  drag(ref);
  dragPreview(preview);
  drop(ref);

  return (
    <div ref={ref} className={`flex flex-col gap-2 ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <div className="cursor-move">
          <ReorderIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div ref={preview} className="flex flex-col gap-1 p-4 rounded-md bg-muted flex-grow">
          <div className="flex items-center justify-between">
            <div className="font-bold">{item.title}</div>
            <EditIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
          <div className={`text-sm text-muted-foreground ${expandedItems.has(item.title) ? "" : "line-clamp-2"}`}>
            {item.content}
          </div>
        </div>
      </div>
      <button
        className={`text-sm self-end ${expandedItems.has(item.title) ?'text-red-300' : 'text-blue-500'}`}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleExpand(item.title);
        }}
      >
        {expandedItems.has(item.title) ? "See less" : "See more"}
      </button>
    </div>
  );
}

function CustomDragLayer() {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging || !currentOffset) {
    return null
  }

  return (
    <div className="fixed pointer-events-none top-0 left-0 w-full h-full z-50">
      <div
        className="absolute"
        style={{
          transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
        }}
      >
        <div className="flex items-center gap-2">
          <ReorderIcon className="h-6 w-6 text-muted-foreground" />
          <div className="flex flex-col gap-1 p-2 rounded-md bg-muted flex-grow">
            <div className="flex items-center justify-between">
              <div className="font-bold">{item.title}</div>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">{item.content}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContentPicker() {
  const [selectedContentItems, setSelectedContentItems] = useState<{ title: string; content: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearchTerm(searchTerm), 300);
    handler();
    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  const handleContentItemSelect = (item: { title: string; content: string }) => {
    if (selectedContentItems.some((i) => i.title === item.title)) {
      setSelectedContentItems(selectedContentItems.filter((i) => i.title !== item.title));
    } else {
      setSelectedContentItems([...selectedContentItems, item]);
    }
  };

  const handleContentItemReorder = (dragIndex: number, hoverIndex: number) => {
    const updatedItems = [...selectedContentItems];
    [updatedItems[dragIndex], updatedItems[hoverIndex]] = [updatedItems[hoverIndex], updatedItems[dragIndex]];
    setSelectedContentItems(updatedItems);
  };

  const handleInsertIntoDocument = () => {
    const documentText = selectedContentItems.map(({ title, content }) => `${title}\n\n${content}`).join("\n\n");
    if (window.confirm(`Are you sure you want to insert the following text into the document?\n\n${documentText}`)) {
      alert(`Inserted the following text into the document:\n\n${documentText}`);
    }
  };

  const handleToggleExpand = (title: string) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(title)) {
      newExpandedItems.delete(title);
    } else {
      newExpandedItems.add(title);
    }
    setExpandedItems(newExpandedItems);
  };

  const filteredContentItems = [
    {
      title: "Importance of Food Safety",
      content:
        "Food safety is paramount to public health and well-being. It encompasses handling, preparation, and storage practices that prevent foodborne illnesses and contamination. Adhering to food safety guidelines ensures that harmful bacteria, viruses, and parasites do not pose a threat to consumers. From farm to table, each step in the food supply chain must prioritize hygiene and safety to protect individuals from diseases caused by contaminated food. Regular training and adherence to food safety standards help maintain a healthy population and foster trust in food products."
        ,
    },
    {
      title: "Understanding Food Quality",
      content:
        "Food quality refers to the attributes and characteristics of food products that are acceptable to consumers. This includes factors such as taste, appearance, texture, and nutritional value. High-quality food is not only safe to eat but also meets certain standards that make it desirable and satisfying. Ensuring food quality involves careful selection of raw materials, proper processing techniques, and effective quality control measures. By maintaining high standards of food quality, producers can enhance consumer satisfaction and loyalty, promoting a positive reputation for their products.",
    },
    {
      title: "The Role of Temperature in Food Safety",
      content:
        "Temperature control is a critical factor in food safety. Keeping food at the right temperature helps prevent the growth of harmful bacteria and other pathogens. Cold foods should be stored at or below 4°C (40°F) to inhibit bacterial growth, while hot foods should be kept at or above 60°C (140°F) to kill any present pathogens. It's essential to monitor and maintain these temperatures during storage, transportation, and preparation. Using thermometers and following recommended guidelines can ensure food is safe for consumption and reduce the risk of foodborne illnesses.",
    },
    {
      title: "Cross-Contamination Prevention",
      content:
        "Preventing cross-contamination is a key aspect of food safety. Cross-contamination occurs when harmful bacteria or allergens are transferred from one food product to another, leading to potential health risks. To avoid this, it's crucial to keep raw and cooked foods separate, use different cutting boards and utensils for different types of food, and thoroughly clean surfaces and hands after handling raw foods. Implementing these practices in both commercial kitchens and home environments can significantly reduce the risk of foodborne illnesses and protect vulnerable individuals from allergic reactions.",
    },
    {
      title: "The Importance of Food Labels",
      content:
        "Food labels play a vital role in ensuring food safety and quality. They provide consumers with important information about the product, including ingredients, nutritional value, expiration dates, and storage instructions. Reading and understanding food labels can help consumers make informed choices and avoid products that may contain allergens or harmful additives. For producers, accurate labeling is essential to comply with regulations and build trust with customers. Proper labeling practices ensure transparency and accountability, contributing to overall food safety and quality in the market.",
    },
  ].filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4 w-[800px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Select content items</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[600px] p-2">
            <DropdownMenuLabel>Select content items to insert</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Input
              placeholder="Search content items..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            {filteredContentItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                className={`flex flex-col gap-2 p-2 rounded-md hover:bg-muted mb-2 ${
                  selectedContentItems.some((i) => i.title === item.title) ? "bg-gray-300" : ""
                }`}
                onClick={() => handleContentItemSelect(item)}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedContentItems.some((i) => i.title === item.title)}
                    onChange={() => handleContentItemSelect(item)}
                    className="mr-2 h-4 w-4 self-center"
                  />
                  <div className="flex flex-col gap-1 flex-grow">
                    <div className="font-bold">{item.title}</div>
                    <div className={`text-sm text-muted-foreground ${expandedItems.has(item.title) ? "" : "line-clamp-2"}`}>
                      {item.content}
                    </div>
                  </div>
                </div>
                <button
                  className="text-blue-500 text-sm self-end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(item.title);
                  }}
                >
                  {expandedItems.has(item.title) ? "See less" : "See more"}
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Selected content items ({selectedContentItems.length})</h3>
            <Button onClick={handleInsertIntoDocument}>Insert into Document</Button>
          </div>
          {selectedContentItems.length === 0 ? (
            <div className="text-left text-muted-foreground">
              Start by selecting Content Items from the dropdown list.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedContentItems.map((item, index) => (
                <DraggableContentItem
                  key={index}
                  item={item}
                  index={index}
                  moveItem={handleContentItemReorder}
                  expandedItems={expandedItems}
                  handleToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <CustomDragLayer />
    </DndProvider>
  );
}
export default ContentPicker; 

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


function ReorderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  )
}


function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
