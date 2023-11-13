import { useContext, useState } from "react";
import { Label } from "./label";
import MeContext from "@/context/me-context";
import { User } from "@/types/user";
import axiosInstance from "@/service/axios";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { TypographyH4 } from "./typography";
import { toast } from "react-toastify";

export interface Scope {
  name: string;
  description: string;
  parent?: string;
}

function isScopeAllowed(
  scope: string,
  allowedScopes: string[],
  allScopes: any
) {
  if (!allowedScopes) {
    allowedScopes = [];
  }
  const scopeObject = allScopes[scope];
  if (!scopeObject) {
    return false;
  }
  if (
    allowedScopes.includes(scopeObject.name) ||
    allowedScopes.includes(scopeObject.parent as string)
  ) {
    return true;
  } else if (scopeObject.parent) {
    return isScopeAllowed(scopeObject.parent, allowedScopes, allScopes);
  } else {
    return false;
  }
}

const ScopeSelector = ({
  scopes,
  onSelect = () => null,
  user,
  type,
}: {
  scopes: Scope[];
  onSelect: any;
  user: User;
  type: "user" | "client";
}) => {
  const scopesObject: { [name: string]: Scope } = scopes.reduce(
    (scopes, scope) => Object.assign(scopes, { [scope.name]: scope }),
    {}
  );

  const initialScopes: string[] = [];
  scopes.forEach((scope) => {
    if (isScopeAllowed(scope.name, user.scope as string[], scopesObject)) {
      initialScopes.push(scope.name);
    }
  });

  const [selectedItems, setSelectedItems] = useState<string[]>(
    initialScopes as string[]
  );

  const [submitting, setSubmitting] = useState<boolean>(false);

  const { me } = useContext(MeContext);

  const handleToggle = (itemName: string) => {
    const isSelected = selectedItems.includes(itemName);
    let newSelectedItems: string[];

    if (isSelected) {
      // Deselect the item and all its children
      const children = getAllChildren(itemName);
      newSelectedItems = selectedItems.filter(
        (item) => !children.includes(item) && itemName !== item
      );

      // Deselect all parent levels if their children are deselected
      let parent = getParent(itemName);
      while (parent) {
        const parentChildren = scopes.filter((item) => item.parent === parent);
        const anyChildrenDeselected = parentChildren.some(
          (child) => !newSelectedItems.includes(child.name)
        );

        if (anyChildrenDeselected) {
          newSelectedItems = newSelectedItems.filter((item) => item !== parent);
        }

        parent = getParent(parent);
      }
    } else {
      // If the item has children, select all children as well
      const children = getAllChildren(itemName);
      newSelectedItems = [...selectedItems, itemName, ...children];

      // Select all parent levels if their children are deselected
      let parent = getParent(itemName);
      while (parent) {
        const parentChildren = scopes.filter((item) => item.parent === parent);
        const allChildrenSelected = parentChildren.every((child) =>
          newSelectedItems.includes(child.name)
        );

        if (allChildrenSelected && !newSelectedItems.includes(parent)) {
          newSelectedItems.push(parent);
        }

        parent = getParent(parent);
      }
    }

    setSelectedItems(newSelectedItems);
    onSelect(newSelectedItems.join(", "));
  };

  const getParent = (itemName: string) => {
    const item = scopes.find((item) => item.name === itemName);
    return item ? item.parent : null;
  };

  const getAllChildren = (parent: string) => {
    const children = scopes.filter((item) => item.parent === parent);
    let allChildren = [...children.map((child) => child.name)];

    children.forEach((child) => {
      allChildren = [...allChildren, ...getAllChildren(child.name)];
    });

    return allChildren;
  };

  const onSave = async () => {
    let newScopeList = [...selectedItems];
    scopes.forEach((scope) => {
      if (!scope.parent) {
        return;
      }
      if (newScopeList.includes(scope.parent as string)) {
        newScopeList = newScopeList.filter((s) => s !== scope.name);
      }
    });
    console.log(newScopeList);
    setSubmitting(true);
    let promise;
    try {
      promise = axiosInstance.post("/user/admin-api/access", {
        targets: [user._id],
        targetType: type,
        scope: selectedItems,
        operation: "set",
      });
      toast.promise(promise, {
        pending: "Submitting...",
        success: "Update successfull",
        error: "Update failed!",
      });
      await promise;
    } finally {
      setSubmitting(false);
    }
  };

  const renderTree = (items: Scope[], parent = "*") => {
    return items
      .filter((item) => item.parent === parent)
      .map((item) => (
        <div
          key={item.name}
          className={
            !isScopeAllowed(item.name, me?.scope as string[], scopesObject)
              ? "opacity-80"
              : ""
          }
        >
          <Label className="flex items-center my-2">
            <input
              type="checkbox"
              disabled={
                !isScopeAllowed(item.name, me?.scope as string[], scopesObject)
              }
              checked={selectedItems.includes(item.name)}
              onChange={() => handleToggle(item.name)}
            />
            <span className="mx-2">
              <div className="mb-2">{item.name}</div>
              <div className="opacity-40 font-normal">{item.description}</div>
            </span>
          </Label>
          <div className="mx-8">{renderTree(items, item.name)}</div>
        </div>
      ));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <TypographyH4 className="my-4">Permissions</TypographyH4>
          <Button variant="outline">Edit Permissions</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit permissions</DialogTitle>
          <DialogDescription>
            Edit permissions to the profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[450px] overflow-auto">
          {scopes && renderTree(scopes)}
        </div>
        <DialogFooter>
          <Button type="submit" disabled={submitting} onClick={onSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScopeSelector;
