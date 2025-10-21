// Map specification
var mapSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 850,
  height: 400,
  title: "Mean Household Income by State in Malaysia",
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
        graticule: {
          step: [2, 2]  // Lines every 5 degrees
        }
      },
      mark: {
        type: "geoshape",
        fill: null,
        stroke: "gray",
        strokeWidth: 0.3
      },
      projection: {
        type: "mercator",
        center: [109.5, 3],
        scale: 2500,
      }
    },
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/malaysia_map.json",
        format: {
          type: "topojson",
          feature: "ne_10m_admin_1_states_provinces",
        },
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
  width: 1100,
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
    {
      fold: ["income", "expenditure"],
      as: ["category", "amount"],
    },
    {
      calculate:
        "datum.category == 'income' ? 'Mean Income' : 'Mean Expenditure'",
      as: "category_name",
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
          sort: {
            field: "amount",
            op: "mean",
            order: "descending",
          },
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
        ],
      },
    },
    // National average income line
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/hies_district.csv",
      },
      transform: [
        { filter: "datum.poverty <= pov_slider" },
        {
          aggregate: [
            { op: "mean", field: "income_mean", as: "avg_income" },
          ],
        },
      ],
      mark: {
        type: "rule",
        color: "black",
        strokeWidth: 2,
        strokeDash: [6, 4],
      },
      encoding: {
        y: {
          field: "avg_income",
          type: "quantitative",
        },
      },
    },
    // National average value label
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/hies_district.csv",
      },
      transform: [
        { filter: "datum.poverty <= pov_slider" },
        {
          aggregate: [
            { op: "mean", field: "income_mean", as: "avg_income" },
          ],
        },
      ],
      mark: {
        type: "text",
        align: "left",
        dx: 5,
        dy: -5,
        fontSize: 11,
        fontWeight: "bold",
        color: "black",
      },
      encoding: {
        y: {
          field: "avg_income",
          type: "quantitative",
        },
        text: {
          field: "avg_income",
          type: "quantitative",
          format: ",.0f",
        },
        x: { value: 1050 },
      },
    },
    // National average text label
    {
      data: {
        url: "https://raw.githubusercontent.com/ylee0132/FIT3179/refs/heads/main/W9_hw/hies_district.csv",
      },
      transform: [
        { filter: "datum.poverty <= pov_slider" },
        {
          aggregate: [
            { op: "mean", field: "income_mean", as: "avg_income" },
          ],
        },
      ],
      mark: {
        type: "text",
        align: "left",
        dx: 5,
        dy: 15,
        fontSize: 10,
        color: "black",
      },
      encoding: {
        y: {
          field: "avg_income",
          type: "quantitative",
        },
        text: { value: "National Average Income" },
        x: { value: 970 },
      },
    },
  ],
};


// Slope chart specification
var slopeSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 500,
  height: 600,
  title: {
    text: "Income to Expenditure Transitions",
    fontSize: 16,
    anchor: "middle",
  },
  params: [
    {
      name: "top_n",
      value: 5,
      bind: {
        input: "select",
        options: [5, 10],
        labels: ["Top/Bottom 5", "All States"],
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
      calculate:
        "(datum.avg_income - datum.avg_expenditure) / datum.avg_income * 100",
      as: "savings_rate",
    },
    {
      window: [{ op: "rank", as: "income_rank" }],
      sort: [{ field: "avg_income", order: "descending" }],
    },
    {
      filter:
        "datum.income_rank <= top_n || datum.income_rank > (16 - top_n)",
    },
    {
      fold: ["avg_income", "avg_expenditure"],
      as: ["measure", "value"],
    },
    {
      calculate:
        "datum.measure == 'avg_income' ? 'Income' : 'Expenditure'",
      as: "measure_label",
    },
  ],
  layer: [
    // Main slope lines
    {
      params: [
        {
          name: "state_highlight",
          select: {
            type: "point",
            fields: ["state"],
            on: "mouseover",
            clear: "mouseout",
          },
        },
      ],
      mark: { type: "line", strokeWidth: 2, opacity: 0.7 },
      encoding: {
        x: {
          field: "measure_label",
          type: "nominal",
          title: null,
          axis: { labelFontSize: 14, labelAngle: 0, labelPadding: 10 },
          sort: ["Income", "Expenditure"],
        },
        y: {
          field: "value",
          type: "quantitative",
          title: "Amount (RM)",
          axis: { format: ",.0f", grid: true },
        },
        color: {
          field: "state",
          type: "nominal",
          legend: null,
          scale: {
            scheme: "tableau10",
          },
        },
        strokeWidth: {
          condition: { param: "state_highlight", empty: false, value: 4 },
          value: 2,
        },
        opacity: {
          condition: { param: "state_highlight", empty: false, value: 1 },
          value: 0.7,
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
    // Circles at endpoints
    {
      mark: { type: "circle", size: 150, opacity: 0.7 },
      encoding: {
        x: {
          field: "measure_label",
          type: "nominal",
          sort: ["Income", "Expenditure"],
        },
        y: {
          field: "value",
          type: "quantitative",
        },
        color: {
          field: "state",
          type: "nominal",
          legend: null,
          scale: {
            scheme: "tableau10",
          },
        },
        size: {
          condition: {
            param: "state_highlight",
            empty: false,
            value: 300,
          },
          value: 150,
        },
        opacity: {
          condition: { param: "state_highlight", empty: false, value: 1 },
          value: 0.7,
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
    // State labels on left (Income)
    {
      mark: {
        type: "text",
        align: "right",
        dx: -15,
        fontSize: 10,
        fontWeight: "bold",
      },
      encoding: {
        x: {
          field: "measure_label",
          type: "nominal",
          sort: ["Income", "Expenditure"],
        },
        y: { field: "value", type: "quantitative" },
        text: { field: "state", type: "nominal" },
        color: {
          field: "state",
          type: "nominal",
          legend: null,
          scale: {
            scheme: "tableau10",
          },
        },
        opacity: {
          condition: {
            test: "datum.measure == 'avg_income'",
            value: 1,
          },
          value: 0,
        },
      },
    },
    // State labels on right (Expenditure)
    {
      mark: {
        type: "text",
        align: "left",
        dx: 15,
        fontSize: 10,
        fontWeight: "bold",
      },
      encoding: {
        x: {
          field: "measure_label",
          type: "nominal",
          sort: ["Income", "Expenditure"],
        },
        y: { field: "value", type: "quantitative" },
        text: { field: "state", type: "nominal" },
        color: {
          field: "state",
          type: "nominal",
          legend: null,
          scale: {
            scheme: "tableau10",
          },
        },
        opacity: {
          condition: {
            test: "datum.measure == 'avg_expenditure'",
            value: 1,
          },
          value: 0,
        },
      },
    },
    // Arrow indicator annotation
    {
      data: { values: [{}] },
      mark: {
        type: "text",
        align: "left",
        fontSize: 11,
        fontWeight: "bold",
        color: "#5a6860ff",
        dx: 10,
      },
      encoding: {
        x: { value: 250 },
        y: { value: 100 },
        text: { value: "↘ Steeper slope = Higher savings" },
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
  width: 400,
  height: 500,
  autosize: { type: "fit", contains: "padding" },
  title: {
    text: "Salary Distribution by Education Level",
    fontSize: 16,
    anchor: "middle",
  },
  params: [
    {
      name: "exp_range",
      value: 30,
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
  transform: [{ filter: "datum['Years of Experience'] <= exp_range" }],
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
            range: ["#17becf", "#9467bd", "#bcbd22"],
          },
        },
        tooltip: [
          {
            field: "Education Level",
            type: "nominal",
            title: "Education Level",
          },
        ],
      },
    },
  ],
};


// Scatter plot specification
var scatterSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: 700,
  height: 450,
  title: {
    text: "Salary vs Years of Experience",
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
        range: ["#17becf", "#9467bd", "#bcbd22"],
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
      {
        field: "Education Level",
        type: "nominal",
        title: "Education Level",
      },
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
    return vegaEmbed("#boxplot", boxplotSpec, { actions: false, renderer: "svg", });
  })
  .then(function () {
    return vegaEmbed("#scatterplot", scatterSpec, { actions: false });
  })
  .catch(console.error);
