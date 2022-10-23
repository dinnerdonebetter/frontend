export class QueryFilteredResult<T> {
  data: T[];
  page: number;
  limit: number;
  filteredCount: number;
  totalCount: number;

  constructor(
    input: {
      data?: T[];
      page?: number;
      limit?: number;
      filteredCount?: number;
      totalCount?: number;
    } = {}
  ) {
    this.data = input.data || [];
    this.page = input.page || 1;
    this.limit = input.limit || 20;
    this.filteredCount = input.filteredCount || 0;
    this.totalCount = input.totalCount || 0;
  }
}

export type ValidSortType = "asc" | "desc";

export class QueryFilter {
  sortBy: ValidSortType;
  page: number;
  createdBefore?: number;
  createdAfter?: number;
  updatedBefore?: number;
  updatedAfter?: number;
  limit: number;
  includeArchived?: boolean;

  constructor(
    input: {
      sortBy?: ValidSortType;
      page?: number;
      createdBefore?: number;
      createdAfter?: number;
      updatedBefore?: number;
      updatedAfter?: number;
      limit?: number;
      includeArchived?: boolean;
    } = {}
  ) {
    this.sortBy = input.sortBy || "asc";
    this.page = input.page || 1;
    this.createdBefore = input.createdBefore || -1;
    this.createdAfter = input.createdAfter || -1;
    this.updatedBefore = input.updatedBefore || -1;
    this.updatedAfter = input.updatedAfter || -1;
    this.limit = input.limit || 20;
    this.includeArchived = Boolean(input.includeArchived);
  }

  public asURLSearchParams(): URLSearchParams {
    const out = new URLSearchParams();

    if (this.sortBy) out.set("sortBy", this.sortBy);
    if (this.page) out.set("page", this.page.toString());
    if (this.createdBefore)
      out.set("createdBefore", this.createdBefore.toString());
    if (this.createdAfter)
      out.set("createdAfter", this.createdAfter.toString());
    if (this.updatedBefore)
      out.set("updatedBefore", this.updatedBefore.toString());
    if (this.updatedAfter)
      out.set("updatedAfter", this.updatedAfter.toString());
    if (this.limit) out.set("limit", this.limit.toString());
    if (this.includeArchived)
      out.set("includeArchived", this.includeArchived.toString());

    return out;
  }

  public asRecord(): Record<string, string | number | ValidSortType> {
    const params = {} as Record<string, string | number | ValidSortType>;

    if (this.sortBy) params["sortBy"] = this.sortBy;
    if (this.page) params["page"] = this.page.toString();
    if (this.createdBefore)
      params["createdBefore"] = this.createdBefore.toString();
    if (this.createdAfter)
      params["createdAfter"] = this.createdAfter.toString();
    if (this.updatedBefore)
      params["updatedBefore"] = this.updatedBefore.toString();
    if (this.updatedAfter)
      params["updatedAfter"] = this.updatedAfter.toString();
    if (this.limit) params["limit"] = this.limit.toString();
    if (this.includeArchived)
      params["includeArchived"] = this.includeArchived.toString();

    return params;
  }

  public static deriveFromPage(): QueryFilter {
    const qf = QueryFilter.Default();
    const pageParams = new URLSearchParams(window.location.search);

    if (pageParams.has("sortBy"))
      qf.sortBy = pageParams.get("sortBy") as "asc" | "desc";
    if (pageParams.has("page")) qf.page = parseInt(pageParams.get("page")!);
    if (pageParams.has("createdBefore"))
      qf.createdBefore = parseInt(pageParams.get("createdBefore")!);
    if (pageParams.has("createdAfter"))
      qf.createdAfter = parseInt(pageParams.get("createdAfter")!);
    if (pageParams.has("updatedBefore"))
      qf.updatedBefore = parseInt(pageParams.get("updatedBefore")!);
    if (pageParams.has("updatedAfter"))
      qf.updatedAfter = parseInt(pageParams.get("updatedAfter")!);
    if (pageParams.has("limit")) qf.limit = parseInt(pageParams.get("limit")!);
    if (pageParams.has("includeArchived"))
      qf.includeArchived = pageParams.get("includeArchived") === "true";

    return qf;
  }

  public static Default(): QueryFilter {
    return new QueryFilter({
      page: 1,
      limit: 20,
    });
  }
}
