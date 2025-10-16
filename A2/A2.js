// Map specification
var mapSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 850,
  height: 400,
  title: "Mean Household Income by State in Malaysia (2022)",
  projection: {
    type: "mercator",
    center: [109.5, 3],
    scale: 2500,
  },
  layer: [
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/malaysia_map.json",
        format: { type: "topojson", feature: "ne_10m_ocean" },
      },
      mark: { type: "geoshape", fill: "lightblue" },
    },
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/malaysia_map.json",
        format: { type: "topojson", feature: "ne_10m_graticules_30" },
      },
      mark: {
        type: "geoshape",
        fill: null,
        stroke: "lightgray",
        strokeWidth: 0.5,
      },
    },
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/malaysia_map.json",
        format: { type: "topojson", feature: "ne_10m_admin_1_states_provinces" },
      },
      transform: [
        {
          lookup: "properties.name",
          from: {
            data: {
              url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/hies_district.csv",
            },
            key: "state",
            fields: [
              "income_mean",
              "income_median",
              "expenditure_mean",
              "gini",
              "poverty",
            ],
          },
        },
      ],
      mark: { type: "geoshape", stroke: "white", strokeWidth: 1 },
      encoding: {
        color: {
          field: "income_mean",
          type: "quantitative",
          scale: { scheme: "oranges" },
          legend: { title: "Mean Income (RM)" },
        },
        tooltip: [
          { field: "properties.name", type: "nominal", title: "State" },
          {
            field: "income_mean",
            type: "quantitative",
            title: "Mean Income (RM)",
            format: ",.0f",
          },
          {
            field: "income_median",
            type: "quantitative",
            title: "Median Income (RM)",
            format: ",.0f",
          },
          {
            field: "gini",
            type: "quantitative",
            title: "Gini Coefficient",
            format: ".4f",
          },
          {
            field: "poverty",
            type: "quantitative",
            title: "Poverty Rate (%)",
            format: ".1f",
          },
        ],
      },
    },
  ],
};

// Bar chart specification with annotations
var barSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 850,
  height: 450,
  title: {
    text: "Mean Income vs Mean Expenditure by State (2022)",
    fontSize: 16,
    anchor: "middle",
  },
  params: [
    {
      name: "pov_slider",
      value: 15,
      bind: {
        input: "range",
        min: 0,
        max: 15,
        step: 0.5,
        name: "Max Poverty Rate (%): ",
      },
    },
  ],
  data: {
    url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/hies_district.csv",
    format: { type: "csv" },
  },
  transform: [
    { filter: "datum.poverty <= pov_slider" },
    {
      aggregate: [
        { op: "mean", field: "income_mean", as: "income" },
        { op: "mean", field: "expenditure_mean", as: "expenditure" },
        { op: "mean", field: "poverty", as: "poverty_avg" },
        { op: "mean", field: "gini", as: "gini_avg" },
      ],
      groupby: ["state"],
    },
    { fold: ["income", "expenditure"], as: ["category", "amount"] },
    {
      calculate:
        "datum.category == 'income' ? 'Mean Income' : 'Mean Expenditure'",
      as: "category_name",
    },
    {
      calculate: "(datum.income - datum.expenditure) / datum.income * 100",
      as: "savings_rate",
    },
  ],
  layer: [
    {
      mark: { type: "bar" },
      encoding: {
        x: {
          field: "state",
          type: "nominal",
          title: "State",
          axis: { labelAngle: -45, labelFontSize: 11 },
          sort: { field: "amount", op: "mean", order: "descending" },
        },
        y: {
          field: "amount",
          type: "quantitative",
          title: "Amount (RM)",
          axis: { format: ",.0f", grid: true },
        },
        xOffset: { field: "category_name" },
        color: {
          field: "category_name",
          type: "nominal",
          title: "Category",
          scale: {
            domain: ["Mean Income", "Mean Expenditure"],
            range: ["#ff7f0e", "#1f77b4"],
          },
          legend: {
            orient: "top-right",
            titleFontSize: 12,
            labelFontSize: 11,
          },
        },
        tooltip: [
          { field: "state", type: "nominal", title: "State" },
          { field: "category_name", type: "nominal", title: "Category" },
          {
            field: "amount",
            type: "quantitative",
            title: "Amount (RM)",
            format: ",.2f",
          },
          {
            field: "poverty_avg",
            type: "quantitative",
            title: "Poverty Rate (%)",
            format: ".2f",
          },
          {
            field: "gini_avg",
            type: "quantitative",
            title: "Gini Coefficient",
            format: ".4f",
          },
          {
            field: "savings_rate",
            type: "quantitative",
            title: "Savings Rate (%)",
            format: ".2f",
          },
        ],
      },
    },
  ],
};

// Slope chart specification
var slopeSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 850,
  height: 600,
  title: {
    text: "State Rankings: Mean Income vs Mean Expenditure (2022)",
    fontSize: 16,
    anchor: "middle",
  },
  params: [
    {
      name: "top_n",
      value: 10,
      bind: {
        input: "select",
        options: [5, 10, 16],
        labels: ["Top/Bottom 5", "Top/Bottom 10", "All States"],
        name: "Show States: ",
      },
    },
  ],
  data: {
    url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/hies_district.csv",
    format: { type: "csv" },
  },
  transform: [
    {
      aggregate: [
        { op: "mean", field: "income_mean", as: "avg_income" },
        { op: "mean", field: "expenditure_mean", as: "avg_expenditure" },
      ],
      groupby: ["state"],
    },
    {
      calculate: "(datum.avg_income - datum.avg_expenditure) / datum.avg_income * 100",
      as: "savings_rate",
    },
    {
      window: [{ op: "rank", as: "income_rank" }],
      sort: [{ field: "avg_income", order: "descending" }],
    },
    {
      window: [{ op: "rank", as: "expenditure_rank" }],
      sort: [{ field: "avg_expenditure", order: "descending" }],
    },
    {
      filter: "datum.income_rank <= top_n || datum.income_rank > (16 - top_n)",
    },
    {
      fold: ["income_rank", "expenditure_rank"],
      as: ["measure", "rank"],
    },
    {
      calculate: "datum.measure == 'income_rank' ? 'Income' : 'Expenditure'",
      as: "measure_label",
    },
    {
      calculate: "datum.measure == 'income_rank' ? datum.avg_income : datum.avg_expenditure",
      as: "value",
    },
  ],
  layer: [
    {
      mark: { type: "line", strokeWidth: 2, opacity: 0.7 },
      encoding: {
        x: {
          field: "measure_label",
          type: "nominal",
          title: null,
          axis: { labelFontSize: 14, labelAngle: 0 },
        },
        y: {
          field: "rank",
          type: "quantitative",
          title: "Rank",
          scale: { reverse: true },
          axis: { grid: true },
        },
        color: {
          field: "state",
          type: "nominal",
          legend: null,
        },
        detail: { field: "state" },
        tooltip: [
          { field: "state", type: "nominal", title: "State" },
          {
            field: "avg_income",
            type: "quantitative",
            title: "Mean Income (RM)",
            format: ",.2f",
          },
          {
            field: "avg_expenditure",
            type: "quantitative",
            title: "Mean Expenditure (RM)",
            format: ",.2f",
          },
          {
            field: "savings_rate",
            type: "quantitative",
            title: "Savings Rate (%)",
            format: ".2f",
          },
        ],
      },
    },
    {
      mark: { type: "circle", size: 150 },
      encoding: {
        x: {
          field: "measure_label",
          type: "nominal",
        },
        y: {
          field: "rank",
          type: "quantitative",
          scale: { reverse: true },
        },
        color: {
          field: "state",
          type: "nominal",
          legend: null,
        },
        tooltip: [
          { field: "state", type: "nominal", title: "State" },
          {
            field: "value",
            type: "quantitative",
            title: "Amount (RM)",
            format: ",.2f",
          },
          {
            field: "savings_rate",
            type: "quantitative",
            title: "Savings Rate (%)",
            format: ".2f",
          },
        ],
      },
    },
    {
      mark: { type: "text", align: "right", dx: -10, fontSize: 11 },
      encoding: {
        x: { field: "measure_label", type: "nominal" },
        y: { field: "rank", type: "quantitative", scale: { reverse: true } },
        text: { field: "state", type: "nominal" },
        opacity: {
          condition: { test: "datum.measure == 'income_rank'", value: 1 },
          value: 0,
        },
      },
    },
    {
      mark: { type: "text", align: "left", dx: 10, fontSize: 11 },
      encoding: {
        x: { field: "measure_label", type: "nominal" },
        y: { field: "rank", type: "quantitative", scale: { reverse: true } },
        text: { field: "state", type: "nominal" },
        opacity: {
          condition: { test: "datum.measure == 'expenditure_rank'", value: 1 },
          value: 0,
        },
      },
    },
  ],
  config: {
    view: { stroke: null },
  },
};

// Boxplot specification
var boxplotSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 850,
  height: 450,
  autosize: { type: "fit", contains: "padding" },
  title: {
    text: "Salary Distribution by Education Level",
    fontSize: 16,
    anchor: "middle",
  },
  params: [
    {
      name: "exp_range",
      value: [0, 30],
      bind: {
        input: "range",
        min: 0,
        max: 30,
        step: 1,
        name: "Max Years of Experience: ",
      },
    },
  ],
  data: {
    url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/A2/Malaysia_Salary_Data_cleaned.csv",
    format: { type: "csv" },
  },
  transform: [
    { filter: "datum['Years of Experience'] <= exp_range" },
  ],
  layer: [
    {
      mark: { type: "boxplot", extent: 1.5 },
      encoding: {
        x: {
          field: "Education Level",
          type: "nominal",
          title: "Education Level",
          axis: { labelAngle: 0, labelFontSize: 12 },
        },
        y: {
          field: "Salary",
          type: "quantitative",
          title: "Salary (RM)",
          scale: { zero: false },
          axis: { format: ",.0f", grid: true },
        },
        color: {
          field: "Education Level",
          type: "nominal",
          legend: null,
          scale: {
            domain: ["Bachelor's", "Master's", "PhD"],
            range: ["#1f77b4", "#ff7f0e", "#2ca02c"],
          },
        },
        tooltip: [
          { field: "Education Level", type: "nominal", title: "Education Level" },
        ],
      },
    },
  ],
};

// Scatter plot specification
var scatterSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 850,
  height: 450,
  title: {
    text: "Salary vs Years of Experience by Education Level",
    fontSize: 16,
    anchor: "middle",
  },
  params: [
    {
      name: "gender_select",
      value: "All",
      bind: {
        input: "select",
        options: ["All", "Male", "Female"],
        name: "Filter by Gender: ",
      },
    },
  ],
  data: {
    url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/A2/Malaysia_Salary_Data_cleaned.csv",
    format: { type: "csv" },
  },
  transform: [
    {
      filter: "gender_select == 'All' || datum.Gender == gender_select",
    },
  ],
  mark: { type: "circle", opacity: 0.6 },
  encoding: {
    x: {
      field: "Years of Experience",
      type: "quantitative",
      title: "Years of Experience",
      scale: { zero: false },
      axis: { grid: true },
    },
    y: {
      field: "Salary",
      type: "quantitative",
      title: "Salary (RM)",
      scale: { zero: false },
      axis: { format: ",.0f", grid: true },
    },
    color: {
      field: "Education Level",
      type: "nominal",
      title: "Education Level",
      scale: {
        domain: ["Bachelor's", "Master's", "PhD"],
        range: ["#1f77b4", "#ff7f0e", "#2ca02c"],
      },
      legend: {
        orient: "top-right",
        titleFontSize: 12,
        labelFontSize: 11,
      },
    },
    size: {
      field: "Age",
      type: "quantitative",
      title: "Age",
      scale: { range: [30, 400] },
      legend: {
        orient: "top-right",
        titleFontSize: 12,
        labelFontSize: 11,
      },
    },
    tooltip: [
      { field: "Age", type: "quantitative", title: "Age" },
      { field: "Gender", type: "nominal", title: "Gender" },
      { field: "Education Level", type: "nominal", title: "Education Level" },
      { field: "Job Title", type: "nominal", title: "Job Title" },
      {
        field: "Years of Experience",
        type: "quantitative",
        title: "Years of Experience",
      },
      {
        field: "Salary",
        type: "quantitative",
        title: "Salary (RM)",
        format: ",.2f",
      },
    ],
  },
};

// Embed all visualizations
vegaEmbed("#map", mapSpec, { actions: false })
  .then(function () {
    return vegaEmbed("#barchart", barSpec, { actions: false });
  })
  .then(function () {
    return vegaEmbed("#slopechart", slopeSpec, { actions: false });
  })
  .then(function () {
    return vegaEmbed("#boxplot", boxplotSpec, { actions: false });
  })
  .then(function () {
    return vegaEmbed("#scatterplot", scatterSpec, { actions: false });
  })
  .catch(console.error);